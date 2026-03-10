import { db } from '@/lib/db'
import { eq, and, desc, ilike } from 'drizzle-orm'
import { recipes } from '@/lib/db/schema'

export async function findRecipes(userId: string, filters?: {
  search?: string
  tags?: string[]
  difficulty?: string
  maxTime?: number
}) {
  const conditions = [eq(recipes.createdBy, userId)]

  if (filters?.search) {
    conditions.push(ilike(recipes.title, `%${filters.search}%`))
  }

  if (filters?.difficulty) {
    conditions.push(eq(recipes.difficulty, filters.difficulty))
  }

  return db.select().from(recipes)
    .where(and(...conditions))
    .orderBy(desc(recipes.updatedAt))
}

export async function findRecipeById(id: number) {
  const result = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1)
  return result[0] ?? null
}

export async function searchRecipes(userId: string, query: string) {
  return db.select().from(recipes)
    .where(and(
      eq(recipes.createdBy, userId),
      ilike(recipes.title, `%${query}%`)
    ))
    .orderBy(desc(recipes.updatedAt))
    .limit(20)
}

export async function findCookidooRecipes(userId: string) {
  return db.select().from(recipes)
    .where(and(
      eq(recipes.createdBy, userId),
      eq(recipes.recipeSource, 'cookidoo'),
    ))
    .orderBy(desc(recipes.updatedAt))
}
