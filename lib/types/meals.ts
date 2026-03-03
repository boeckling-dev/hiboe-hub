import type { Recipe, MealPlan, MealPlanEntry } from '@/lib/db/schema'

// Extended entry with recipe data joined
export interface MealPlanEntryWithRecipe extends MealPlanEntry {
  recipe: Recipe | null
}

// A full meal plan with all entries
export interface MealPlanWithEntries extends MealPlan {
  entries: MealPlanEntryWithRecipe[]
}

// AI suggestion before it becomes a real entry/recipe
export interface AISuggestion {
  day: Day
  mealType: MealType
  category: Category
  recipe: {
    title: string
    description: string
    prepTime: number
    cookTime: number
    servings: number
    difficulty: string
    tags: string[]
    ingredients: { name: string; quantity: string; unit: string }[]
    instructions: { step: number; text: string }[]
    sourceUrl: string | null
  }
  reasoning: string
}

export interface AISuggestionSet {
  suggestions: AISuggestion[]
  weekSummary: string
  shoppingEstimate: string
}

// Constants
export const DAYS = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'] as const
export type Day = (typeof DAYS)[number]

export const DAY_LABELS: Record<Day, string> = {
  mo: 'Montag',
  di: 'Dienstag',
  mi: 'Mittwoch',
  do: 'Donnerstag',
  fr: 'Freitag',
  sa: 'Samstag',
  so: 'Sonntag',
}

export const DAY_LABELS_SHORT: Record<Day, string> = {
  mo: 'Mo',
  di: 'Di',
  mi: 'Mi',
  do: 'Do',
  fr: 'Fr',
  sa: 'Sa',
  so: 'So',
}

export const MEAL_TYPES = ['lunch', 'dinner'] as const
export type MealType = (typeof MEAL_TYPES)[number]

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
}

export const CATEGORIES = ['alle', 'erwachsene', 'kinder'] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  alle: 'Alle',
  erwachsene: 'Erwachsene',
  kinder: 'Kinder',
}

export const CATEGORY_COLORS: Record<Category, { bg: string; border: string; text: string }> = {
  alle: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  erwachsene: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  kinder: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
}

export const MEAL_SOURCES = ['rezept', 'lieferservice', 'vorrat'] as const
export type MealSource = (typeof MEAL_SOURCES)[number]

export const MEAL_SOURCE_LABELS: Record<MealSource, string> = {
  rezept: 'Rezept',
  lieferservice: 'Lieferservice',
  vorrat: 'Vorrat',
}

// Shopping list categories for store sections
export const SHOPPING_CATEGORIES = [
  'Obst & Gemüse',
  'Kühlregal',
  'Tiefkühl',
  'Brot & Backwaren',
  'Konserven & Trockenwaren',
  'Gewürze & Öle',
  'Getränke',
  'Sonstiges',
] as const

// Week context for AI planning
export interface WeekContext {
  specialEvents?: string[]
  eatingOutDays?: string[]
  leftoversFromLastWeek?: string[]
}
