import { db } from '@/lib/db'
import { eq, and, desc, inArray } from 'drizzle-orm'
import { mealPlans, mealPlanEntries, recipes } from '@/lib/db/schema'
import type { MealPlanWithEntries } from '@/lib/types/meals'

export async function findActivePlanWithEntries(userId: string): Promise<MealPlanWithEntries | null> {
  const plan = await db.select().from(mealPlans)
    .where(and(
      eq(mealPlans.createdBy, userId),
      eq(mealPlans.status, 'active')
    ))
    .limit(1)

  if (!plan[0]) return null

  const entries = await db
    .select({
      entry: mealPlanEntries,
      recipe: recipes,
    })
    .from(mealPlanEntries)
    .leftJoin(recipes, eq(mealPlanEntries.recipeId, recipes.id))
    .where(eq(mealPlanEntries.mealPlanId, plan[0].id))

  return {
    ...plan[0],
    entries: entries.map(e => ({
      ...e.entry,
      recipe: e.recipe,
    })),
  }
}

export async function findPlanWithEntries(planId: number): Promise<MealPlanWithEntries | null> {
  const plan = await db.select().from(mealPlans)
    .where(eq(mealPlans.id, planId))
    .limit(1)

  if (!plan[0]) return null

  const entries = await db
    .select({
      entry: mealPlanEntries,
      recipe: recipes,
    })
    .from(mealPlanEntries)
    .leftJoin(recipes, eq(mealPlanEntries.recipeId, recipes.id))
    .where(eq(mealPlanEntries.mealPlanId, plan[0].id))

  return {
    ...plan[0],
    entries: entries.map(e => ({
      ...e.entry,
      recipe: e.recipe,
    })),
  }
}

export async function findRecentPlans(userId: string, limit = 10) {
  return db.select().from(mealPlans)
    .where(eq(mealPlans.createdBy, userId))
    .orderBy(desc(mealPlans.weekStartDate))
    .limit(limit)
}

export async function findRecentlyUsedRecipes(userId: string, planCount = 3) {
  const recentPlans = await db.select({ id: mealPlans.id }).from(mealPlans)
    .where(eq(mealPlans.createdBy, userId))
    .orderBy(desc(mealPlans.weekStartDate))
    .limit(planCount)

  if (recentPlans.length === 0) return []

  const planIds = recentPlans.map(p => p.id)

  const entries = await db.select({ recipeId: mealPlanEntries.recipeId })
    .from(mealPlanEntries)
    .where(inArray(mealPlanEntries.mealPlanId, planIds))

  const recipeIds = [...new Set(entries.map(e => e.recipeId).filter((id): id is number => id !== null))]

  if (recipeIds.length === 0) return []

  return db.select().from(recipes).where(inArray(recipes.id, recipeIds))
}
