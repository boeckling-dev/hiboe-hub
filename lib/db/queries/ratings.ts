import { db } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { mealRatings } from '@/lib/db/schema'

export async function findRatingsByRecipe(recipeId: number) {
  return db
    .select()
    .from(mealRatings)
    .where(eq(mealRatings.recipeId, recipeId))
    .orderBy(desc(mealRatings.createdAt))
}

export async function findRecentRatings(userId: string, limit = 50) {
  return db
    .select()
    .from(mealRatings)
    .where(eq(mealRatings.createdBy, userId))
    .orderBy(desc(mealRatings.createdAt))
    .limit(limit)
}
