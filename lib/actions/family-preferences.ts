'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { familyPreferences, type NewFamilyPreferences } from '@/lib/db/schema'
import { findPreferences } from '@/lib/db/queries/preferences'
import { revalidatePath } from 'next/cache'

export async function getFamilyPreferences() {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  const existing = await findPreferences(userId)
  if (existing) return existing

  // Create default preferences if none exist
  const result = await db.insert(familyPreferences).values({
    createdBy: userId,
  }).returning()

  return result[0]
}

export async function updateFamilyPreferences(data: Partial<Omit<NewFamilyPreferences, 'createdBy'>>) {
  const { userId } = await auth()
  if (!userId) throw new Error('Nicht angemeldet')

  const existing = await findPreferences(userId)

  if (existing) {
    const result = await db.update(familyPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(familyPreferences.id, existing.id))
      .returning()

    revalidatePath('/meals/einstellungen')
    return result[0]
  }

  // Create new if doesn't exist
  const result = await db.insert(familyPreferences).values({
    ...data,
    createdBy: userId,
  }).returning()

  revalidatePath('/meals/einstellungen')
  return result[0]
}
