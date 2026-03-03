import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { familyPreferences } from '@/lib/db/schema'

export async function findPreferences(userId: string) {
  const result = await db.select().from(familyPreferences)
    .where(eq(familyPreferences.createdBy, userId))
    .limit(1)
  return result[0] ?? null
}
