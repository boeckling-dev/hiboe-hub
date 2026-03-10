'use server'

import { auth } from '@clerk/nextjs/server'
import { generateWeeklyMealPlan, generateSingleAlternative } from '@/lib/ai/meal-planner'
import { getFamilyPreferences } from '@/lib/actions/family-preferences'
import { findRecentlyUsedRecipes } from '@/lib/db/queries/meal-plans'
import { findRecentRatings } from '@/lib/db/queries/ratings'
import { findCookidooRecipes } from '@/lib/db/queries/recipes'
import type { WeekContext, AISuggestionSet, AISuggestion } from '@/lib/types/meals'

// ─── Result Types ────────────────────────────────────────────────────────────

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── Season & Month Helpers ──────────────────────────────────────────────────

const GERMAN_MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
] as const

function getGermanSeason(date: Date): string {
  const month = date.getMonth() // 0-indexed
  if (month >= 2 && month <= 4) return 'Frühling'
  if (month >= 5 && month <= 7) return 'Sommer'
  if (month >= 8 && month <= 10) return 'Herbst'
  return 'Winter'
}

function getGermanMonth(date: Date): string {
  return GERMAN_MONTHS[date.getMonth()]
}

// ─── Error Classification ────────────────────────────────────────────────────

function classifyError(raw: string): string {
  // API key issues
  if (/api.?key|auth|unauthorized|401/i.test(raw))
    return `KI-Service Fehler: API-Key Problem. (${raw.slice(0, 120)})`

  // Rate limits
  if (/rate|429|too many/i.test(raw))
    return 'Zu viele Anfragen. Bitte versuche es in einer Minute erneut.'

  // Model not found
  if (/model|not.?found|404/i.test(raw))
    return `KI-Modell nicht verfügbar. (${raw.slice(0, 120)})`

  // Network / timeout
  if (/timeout|ECONNREFUSED|ENOTFOUND|network|fetch failed/i.test(raw))
    return `Netzwerkfehler beim Aufruf der KI. (${raw.slice(0, 120)})`

  // DB errors
  if (/relation|column|database|drizzle|postgres|sql/i.test(raw))
    return `Datenbankfehler: ${raw.slice(0, 150)}`

  // Pass through the actual error (truncated) for anything else
  return `Fehler: ${raw.slice(0, 200)}`
}

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function generateWeeklySuggestions(params: {
  weekStartDate: Date
  weekContext?: WeekContext
}): Promise<ActionResult<AISuggestionSet>> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: 'Nicht angemeldet. Bitte melde dich zuerst an.' }
  }

  try {
    // Preferences are required; history and ratings are optional (tables may not exist yet)
    const preferences = await getFamilyPreferences()
    const [recentRecipes, recentRatings, cookidooFavorites] = await Promise.all([
      findRecentlyUsedRecipes(userId).catch(() => []),
      findRecentRatings(userId).catch(() => []),
      findCookidooRecipes(userId).catch(() => []),
    ])

    // Ensure Date object (may arrive as ISO string from client serialization)
    const currentDate = params.weekStartDate instanceof Date
      ? params.weekStartDate
      : new Date(params.weekStartDate)
    const currentSeason = getGermanSeason(currentDate)
    const currentMonth = getGermanMonth(currentDate)

    const data = await generateWeeklyMealPlan({
      familyPreferences: preferences,
      recentMealHistory: recentRecipes,
      recentRatings,
      weekContext: params.weekContext,
      currentSeason,
      currentMonth,
      cookidooFavorites: preferences.preferCookidooRecipes ? cookidooFavorites : undefined,
    })

    return { success: true, data }
  } catch (err) {
    console.error('[generateWeeklySuggestions]', err)
    const raw = err instanceof Error ? err.message : String(err)
    return { success: false, error: classifyError(raw) }
  }
}

export async function generateAlternativeSuggestion(params: {
  day: string
  mealType: string
  category: string
  excludeRecipeIds: number[]
}): Promise<ActionResult<AISuggestion>> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: 'Nicht angemeldet.' }
  }

  try {
    const preferences = await getFamilyPreferences()

    const currentDate = new Date()
    const currentSeason = getGermanSeason(currentDate)
    const currentMonth = getGermanMonth(currentDate)

    const data = await generateSingleAlternative({
      day: params.day,
      mealType: params.mealType,
      category: params.category,
      familyPreferences: preferences,
      currentSeason,
      currentMonth,
    })

    return { success: true, data }
  } catch (err) {
    console.error('[generateAlternativeSuggestion]', err)
    const raw = err instanceof Error ? err.message : String(err)
    return { success: false, error: classifyError(raw) }
  }
}
