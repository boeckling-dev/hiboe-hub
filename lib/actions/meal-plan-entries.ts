'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { mealPlanEntries, type NewMealPlanEntry } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'

export async function upsertMealPlanEntry(data: {
  id?: number
  mealPlanId: number
  day: string
  mealType: string
  category: string
  recipeId?: number | null
  customMealNote?: string | null
  mealSource: 'rezept' | 'lieferservice' | 'vorrat'
  deliveryServiceName?: string | null
  vorratNote?: string | null
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  if (data.id) {
    const result = await db.update(mealPlanEntries)
      .set({
        day: data.day,
        mealType: data.mealType,
        category: data.category,
        recipeId: data.recipeId,
        customMealNote: data.customMealNote,
        mealSource: data.mealSource,
        deliveryServiceName: data.deliveryServiceName,
        vorratNote: data.vorratNote,
      })
      .where(eq(mealPlanEntries.id, data.id))
      .returning()

    revalidatePath('/meals')
    return result[0]
  }

  const result = await db.insert(mealPlanEntries).values({
    mealPlanId: data.mealPlanId,
    day: data.day,
    mealType: data.mealType,
    category: data.category,
    recipeId: data.recipeId ?? null,
    customMealNote: data.customMealNote ?? null,
    mealSource: data.mealSource,
    deliveryServiceName: data.deliveryServiceName ?? null,
    vorratNote: data.vorratNote ?? null,
  }).returning()

  revalidatePath('/meals')
  return result[0]
}

export async function swapMealPlanEntries(entryIdA: number, entryIdB: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  const [a, b] = await Promise.all([
    db.select().from(mealPlanEntries).where(eq(mealPlanEntries.id, entryIdA)).then(r => r[0]),
    db.select().from(mealPlanEntries).where(eq(mealPlanEntries.id, entryIdB)).then(r => r[0]),
  ])

  if (!a || !b) throw new Error('Einträge nicht gefunden')

  await Promise.all([
    db.update(mealPlanEntries)
      .set({ day: b.day, mealType: b.mealType })
      .where(eq(mealPlanEntries.id, entryIdA)),
    db.update(mealPlanEntries)
      .set({ day: a.day, mealType: a.mealType })
      .where(eq(mealPlanEntries.id, entryIdB)),
  ])

  revalidatePath('/meals')
}

export async function removeMealPlanEntry(entryId: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  await db.delete(mealPlanEntries).where(eq(mealPlanEntries.id, entryId))
  revalidatePath('/meals')
}

export async function bulkCreateEntries(mealPlanId: number, entries: Omit<NewMealPlanEntry, 'mealPlanId'>[]) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  if (entries.length === 0) return []

  const result = await db.insert(mealPlanEntries)
    .values(entries.map(e => ({ ...e, mealPlanId })))
    .returning()

  revalidatePath('/meals')
  return result
}
