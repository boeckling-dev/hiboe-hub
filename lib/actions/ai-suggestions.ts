'use server'

import { auth } from '@clerk/nextjs/server'
import { generateWeeklyMealPlan, generateSingleAlternative } from '@/lib/ai/meal-planner'
import { getFamilyPreferences } from '@/lib/actions/family-preferences'
import { findRecentlyUsedRecipes } from '@/lib/db/queries/meal-plans'
import { findRecentRatings } from '@/lib/db/queries/ratings'
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
    const [preferences, recentRecipes, recentRatings] = await Promise.all([
      getFamilyPreferences(),
      findRecentlyUsedRecipes(userId),
      findRecentRatings(userId),
    ])

    const currentDate = params.weekStartDate
    const currentSeason = getGermanSeason(currentDate)
    const currentMonth = getGermanMonth(currentDate)

    const data = await generateWeeklyMealPlan({
      familyPreferences: preferences,
      recentMealHistory: recentRecipes,
      recentRatings,
      weekContext: params.weekContext,
      currentSeason,
      currentMonth,
    })

    return { success: true, data }
  } catch (err) {
    console.error('[generateWeeklySuggestions]', err)

    const message =
      err instanceof Error && err.message.includes('API key')
        ? 'Der KI-Service ist nicht konfiguriert. Bitte ANTHROPIC_API_KEY in den Umgebungsvariablen setzen.'
        : err instanceof Error && err.message.includes('rate')
          ? 'Zu viele Anfragen. Bitte versuche es in einer Minute erneut.'
          : 'Fehler beim Erstellen der Vorschläge. Bitte versuche es erneut.'

    return { success: false, error: message }
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
    return { success: false, error: 'Fehler beim Laden des Alternativvorschlags.' }
  }
}
