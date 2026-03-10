'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { recipes, familyPreferences } from '@/lib/db/schema'
import { CookidooClient } from '@/lib/cookidoo/client'
import { cookidooToRecipe, recipeToCookidoo } from '@/lib/cookidoo/mapper'
import { encrypt, decrypt } from '@/lib/cookidoo/crypto'
import { findPreferences } from '@/lib/db/queries/preferences'
import { revalidatePath } from 'next/cache'
import type { CookidooConnectionResult, CookidooRecipe, CookidooCollection, CookidooRecipeDetail } from '@/lib/cookidoo/types'

// ─── Result Types ────────────────────────────────────────────────────────────

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── Helpers ────────────────────────────────────────────────────────────────

async function createAuthenticatedClient(): Promise<CookidooClient> {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  const prefs = await findPreferences(userId)
  if (!prefs?.cookidooEmail || !prefs?.cookidooPasswordEncrypted) {
    throw new Error('Cookidoo nicht konfiguriert. Bitte zuerst in den Einstellungen verbinden.')
  }

  const client = new CookidooClient()
  const password = decrypt(prefs.cookidooPasswordEncrypted)
  await client.login({ email: prefs.cookidooEmail, password })
  return client
}

// ─── Connection ─────────────────────────────────────────────────────────────

/**
 * Test the Cookidoo connection with provided credentials.
 * Does NOT save the credentials - that's done via saveCookidooCredentials.
 */
export async function testCookidooConnection(
  email: string,
  password: string,
): Promise<ActionResult<CookidooConnectionResult>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Nicht angemeldet' }

  try {
    const client = new CookidooClient()
    await client.login({ email, password })

    // Try to fetch collections to verify the connection works
    const collections = await client.getCollections()
    const totalRecipes = collections.reduce((sum, c) => sum + c.recipeCount, 0)

    return {
      success: true,
      data: { connected: true, recipeCount: totalRecipes },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      success: true,
      data: { connected: false, error: message },
    }
  }
}

/**
 * Save Cookidoo credentials (encrypted) and Thermomix preferences.
 */
export async function saveCookidooCredentials(data: {
  email: string
  password: string
  thermomixModel: string
  preferCookidooRecipes: boolean
}): Promise<ActionResult<void>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Nicht angemeldet' }

  try {
    const encryptedPassword = encrypt(data.password)

    const prefs = await findPreferences(userId)

    if (prefs) {
      await db.update(familyPreferences)
        .set({
          cookidooEmail: data.email,
          cookidooPasswordEncrypted: encryptedPassword,
          thermomixModel: data.thermomixModel,
          preferCookidooRecipes: data.preferCookidooRecipes,
          updatedAt: new Date(),
        })
        .where(eq(familyPreferences.id, prefs.id))
    } else {
      await db.insert(familyPreferences).values({
        createdBy: userId,
        cookidooEmail: data.email,
        cookidooPasswordEncrypted: encryptedPassword,
        thermomixModel: data.thermomixModel,
        preferCookidooRecipes: data.preferCookidooRecipes,
      })
    }

    revalidatePath('/meals/einstellungen')
    return { success: true, data: undefined }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Fehler beim Speichern: ${message}` }
  }
}

// ─── Search & Browse ────────────────────────────────────────────────────────

/**
 * Search for recipes in Cookidoo.
 */
export async function searchCookidooRecipes(
  query: string,
): Promise<ActionResult<CookidooRecipe[]>> {
  try {
    const client = await createAuthenticatedClient()
    const results = await client.searchRecipes(query)
    return { success: true, data: results }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

/**
 * Get the user's Cookidoo collections.
 */
export async function getCookidooCollections(): Promise<ActionResult<CookidooCollection[]>> {
  try {
    const client = await createAuthenticatedClient()
    const collections = await client.getCollections()
    return { success: true, data: collections }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

/**
 * Get recipes from a specific Cookidoo collection.
 */
export async function getCookidooCollectionRecipes(
  collectionId: string,
  listType: 'custom' | 'managed' = 'custom',
): Promise<ActionResult<CookidooRecipe[]>> {
  try {
    const client = await createAuthenticatedClient()
    const results = await client.getCollectionRecipes(collectionId, listType)
    return { success: true, data: results }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

/**
 * Get full details for a Cookidoo recipe.
 */
export async function getCookidooRecipeDetails(
  recipeId: string,
): Promise<ActionResult<CookidooRecipeDetail>> {
  try {
    const client = await createAuthenticatedClient()
    const detail = await client.getRecipeDetails(recipeId)
    return { success: true, data: detail }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

// ─── Import ─────────────────────────────────────────────────────────────────

/**
 * Import Cookidoo recipes into the local database.
 * Skips recipes that are already imported (same cookidooId).
 */
export async function importCookidooRecipes(
  recipeIds: string[],
): Promise<ActionResult<{ imported: number; skipped: number }>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Nicht angemeldet' }

  try {
    const client = await createAuthenticatedClient()

    let imported = 0
    let skipped = 0

    // Process recipes sequentially to avoid overwhelming the Cookidoo API
    for (const recipeId of recipeIds) {
      // Check if already imported
      const existing = await db.select({ id: recipes.id })
        .from(recipes)
        .where(and(
          eq(recipes.cookidooId, recipeId),
          eq(recipes.createdBy, userId),
        ))
        .limit(1)

      if (existing.length > 0) {
        skipped++
        continue
      }

      // Fetch details from Cookidoo
      const detail = await client.getRecipeDetails(recipeId)
      const recipeData = cookidooToRecipe(detail, recipeId)

      // Save to DB
      await db.insert(recipes).values({
        ...recipeData,
        createdBy: userId,
      })

      imported++
    }

    revalidatePath('/meals/rezepte')
    return { success: true, data: { imported, skipped } }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Import fehlgeschlagen: ${message}` }
  }
}

// ─── Export ─────────────────────────────────────────────────────────────────

/**
 * Export a local recipe to Cookidoo.
 * Creates a custom recipe in the user's Cookidoo account.
 */
export async function exportRecipeToCookidoo(
  recipeId: number,
): Promise<ActionResult<{ cookidooId: string; cookidooUrl: string }>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Nicht angemeldet' }

  try {
    // Get the recipe from our DB
    const recipe = await db.select()
      .from(recipes)
      .where(and(eq(recipes.id, recipeId), eq(recipes.createdBy, userId)))
      .limit(1)
      .then(r => r[0])

    if (!recipe) {
      return { success: false, error: 'Rezept nicht gefunden' }
    }

    // Check if already exported
    if (recipe.cookidooId) {
      return {
        success: true,
        data: {
          cookidooId: recipe.cookidooId,
          cookidooUrl: `https://cookidoo.de/recipes/recipe/de-DE/${recipe.cookidooId}`,
        },
      }
    }

    const client = await createAuthenticatedClient()
    const cookidooData = recipeToCookidoo(recipe)
    const cookidooId = await client.exportFullRecipe(cookidooData)

    // Save the Cookidoo ID back to our DB
    await db.update(recipes)
      .set({
        cookidooId,
        sourceUrl: `https://cookidoo.de/recipes/recipe/de-DE/${cookidooId}`,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, recipeId))

    revalidatePath(`/meals/rezepte/${recipeId}`)
    return {
      success: true,
      data: {
        cookidooId,
        cookidooUrl: `https://cookidoo.de/recipes/recipe/de-DE/${cookidooId}`,
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Export fehlgeschlagen: ${message}` }
  }
}
