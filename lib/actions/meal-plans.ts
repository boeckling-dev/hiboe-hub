'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { mealPlans } from '@/lib/db/schema'
import { findActivePlanWithEntries, findPlanWithEntries, findRecentPlans } from '@/lib/db/queries/meal-plans'
import { revalidatePath } from 'next/cache'

export async function createMealPlan(weekStartDate: Date) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  const result = await db.insert(mealPlans).values({
    weekStartDate,
    createdBy: userId,
    status: 'draft',
  }).returning()

  revalidatePath('/meals')
  return result[0]
}

export async function getActiveMealPlan() {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  return findActivePlanWithEntries(userId)
}

export async function getMealPlanWithEntries(planId: number) {
  return findPlanWithEntries(planId)
}

export async function activateMealPlan(planId: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  // Archive any currently active plan
  await db.update(mealPlans)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(and(
      eq(mealPlans.createdBy, userId),
      eq(mealPlans.status, 'active')
    ))

  // Activate the new plan
  await db.update(mealPlans)
    .set({ status: 'active', updatedAt: new Date() })
    .where(and(eq(mealPlans.id, planId), eq(mealPlans.createdBy, userId)))

  revalidatePath('/meals')
  revalidatePath('/')
}

export async function archiveMealPlan(planId: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  await db.update(mealPlans)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(and(eq(mealPlans.id, planId), eq(mealPlans.createdBy, userId)))

  revalidatePath('/meals')
}

export async function getMealPlanHistory(limit = 10) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  return findRecentPlans(userId, limit)
}
