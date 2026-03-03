'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { mealRatings } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'

export async function rateMeal(data: {
  recipeId: number
  mealPlanEntryId?: number
  rating: 1 | 2
  kidsLikedIt?: boolean
  note?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  const result = await db.insert(mealRatings).values({
    recipeId: data.recipeId,
    mealPlanEntryId: data.mealPlanEntryId ?? null,
    rating: data.rating,
    kidsLikedIt: data.kidsLikedIt ?? null,
    note: data.note ?? null,
    createdBy: userId,
  }).returning()

  revalidatePath('/meals')
  return result[0]
}

export async function getRecipeRatings(recipeId: number) {
  return db.select().from(mealRatings)
    .where(eq(mealRatings.recipeId, recipeId))
}
