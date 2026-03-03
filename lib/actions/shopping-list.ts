'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { shoppingListItems, mealPlanEntries, recipes } from '@/lib/db/schema'
import { findShoppingListByPlan } from '@/lib/db/queries/shopping-list'
import { revalidatePath } from 'next/cache'

export async function generateShoppingList(mealPlanId: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  // Get all entries with recipes for this plan
  const entries = await db
    .select({ recipe: recipes })
    .from(mealPlanEntries)
    .innerJoin(recipes, eq(mealPlanEntries.recipeId, recipes.id))
    .where(eq(mealPlanEntries.mealPlanId, mealPlanId))

  // Aggregate ingredients
  const ingredientMap = new Map<string, { quantity: string; unit: string; category: string | null }>()

  for (const { recipe } of entries) {
    if (!recipe.ingredients) continue
    for (const ing of recipe.ingredients) {
      const key = ing.name.toLowerCase()
      if (ingredientMap.has(key)) {
        // Simple: keep first occurrence's quantity (AI will merge smarter later)
        continue
      }
      ingredientMap.set(key, {
        quantity: ing.quantity,
        unit: ing.unit,
        category: null, // Will be categorized by AI later
      })
    }
  }

  // Delete existing items for this plan
  await db.delete(shoppingListItems).where(eq(shoppingListItems.mealPlanId, mealPlanId))

  // Insert new items
  const items = Array.from(ingredientMap.entries()).map(([name, data]) => ({
    mealPlanId,
    ingredient: name,
    quantity: data.quantity,
    unit: data.unit,
    category: data.category,
    checked: false,
  }))

  if (items.length === 0) return []

  const result = await db.insert(shoppingListItems).values(items).returning()
  revalidatePath(`/meals/${mealPlanId}/einkaufsliste`)
  return result
}

export async function getShoppingList(mealPlanId: number) {
  return findShoppingListByPlan(mealPlanId)
}

export async function toggleShoppingItem(itemId: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  const item = await db.select().from(shoppingListItems)
    .where(eq(shoppingListItems.id, itemId))
    .limit(1)

  if (!item[0]) throw new Error('Item nicht gefunden')

  await db.update(shoppingListItems)
    .set({ checked: !item[0].checked })
    .where(eq(shoppingListItems.id, itemId))

  revalidatePath(`/meals/${item[0].mealPlanId}/einkaufsliste`)
}

export async function addShoppingItem(data: {
  mealPlanId: number
  ingredient: string
  quantity?: string
  unit?: string
  category?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  const result = await db.insert(shoppingListItems).values({
    mealPlanId: data.mealPlanId,
    ingredient: data.ingredient,
    quantity: data.quantity ?? null,
    unit: data.unit ?? null,
    category: data.category ?? null,
    checked: false,
  }).returning()

  revalidatePath(`/meals/${data.mealPlanId}/einkaufsliste`)
  return result[0]
}

export async function removeShoppingItem(itemId: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  const item = await db.select().from(shoppingListItems)
    .where(eq(shoppingListItems.id, itemId))
    .limit(1)

  await db.delete(shoppingListItems).where(eq(shoppingListItems.id, itemId))

  if (item[0]) {
    revalidatePath(`/meals/${item[0].mealPlanId}/einkaufsliste`)
  }
}
