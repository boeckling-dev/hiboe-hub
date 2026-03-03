'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { recipes, type NewRecipe } from '@/lib/db/schema'
import { findRecipes, findRecipeById } from '@/lib/db/queries/recipes'
import { revalidatePath } from 'next/cache'

export async function createRecipe(data: Omit<NewRecipe, 'createdBy'>) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  const result = await db.insert(recipes).values({
    ...data,
    createdBy: userId,
  }).returning()

  revalidatePath('/meals/rezepte')
  return result[0]
}

export async function updateRecipe(id: number, data: Partial<NewRecipe>) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  const result = await db.update(recipes)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(recipes.id, id), eq(recipes.createdBy, userId)))
    .returning()

  revalidatePath('/meals/rezepte')
  revalidatePath(`/meals/rezepte/${id}`)
  return result[0]
}

export async function deleteRecipe(id: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  await db.delete(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.createdBy, userId)))

  revalidatePath('/meals/rezepte')
}

export async function getRecipes(filters?: {
  search?: string
  tags?: string[]
  difficulty?: string
  maxTime?: number
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  return findRecipes(userId, filters)
}

export async function getRecipe(id: number) {
  return findRecipeById(id)
}
