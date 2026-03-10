import Anthropic from '@anthropic-ai/sdk'
import type { AISuggestionSet, AISuggestion, WeekContext } from '@/lib/types/meals'
import type { FamilyPreferences, Recipe, MealRating } from '@/lib/db/schema'
import {
  buildMealPlanSystemPrompt,
  buildWeeklyPlanUserPrompt,
  buildAlternativeSuggestionPrompt,
} from '@/lib/ai/prompt-templates'
import { resolveRecipeUrls, resolveRecipeUrl } from '@/lib/ai/recipe-url-resolver'

const anthropic = new Anthropic()

// ─── Tool Schemas ────────────────────────────────────────────────────────────

const weeklyPlanTool: Anthropic.Tool = {
  name: 'create_weekly_meal_plan',
  description: 'Erstellt einen vollständigen Wochenplan mit Rezepten für die ganze Familie.',
  input_schema: {
    type: 'object' as const,
    properties: {
      weekSummary: {
        type: 'string',
        description: 'Kurze Zusammenfassung des Wochenplans auf Deutsch.',
      },
      shoppingEstimate: {
        type: 'string',
        description: 'Grobe Einkaufsschätzung (geschätzte Kosten und Hauptzutaten).',
      },
      suggestions: {
        type: 'array',
        description: 'Liste aller Mahlzeitvorschläge für die Woche.',
        items: {
          type: 'object',
          properties: {
            day: {
              type: 'string',
              enum: ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'],
              description: 'Wochentag als Kürzel.',
            },
            mealType: {
              type: 'string',
              enum: ['lunch', 'dinner'],
              description: 'Art der Mahlzeit.',
            },
            category: {
              type: 'string',
              enum: ['alle', 'erwachsene', 'kinder'],
              description: 'Zielgruppe der Mahlzeit.',
            },
            recipe: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Name des Rezepts auf Deutsch.',
                },
                description: {
                  type: 'string',
                  description: 'Kurze Beschreibung des Gerichts.',
                },
                prepTime: {
                  type: 'number',
                  description: 'Zubereitungszeit in Minuten.',
                },
                cookTime: {
                  type: 'number',
                  description: 'Kochzeit in Minuten.',
                },
                servings: {
                  type: 'number',
                  description: 'Anzahl der Portionen.',
                },
                difficulty: {
                  type: 'string',
                  enum: ['einfach', 'mittel', 'schwer'],
                  description: 'Schwierigkeitsgrad.',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Tags für das Rezept (z.B. "vegetarisch", "schnell", "kinderfreundlich").',
                },
                ingredients: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: 'Name der Zutat.' },
                      quantity: { type: 'string', description: 'Menge der Zutat.' },
                      unit: { type: 'string', description: 'Einheit (g, ml, Stück, EL, TL, etc.).' },
                    },
                    required: ['name', 'quantity', 'unit'],
                  },
                  description: 'Liste der Zutaten.',
                },
                instructions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      step: { type: 'number', description: 'Schrittnummer.' },
                      text: { type: 'string', description: 'Anleitung für diesen Schritt.' },
                    },
                    required: ['step', 'text'],
                  },
                  description: 'Zubereitungsschritte.',
                },
                sourceUrl: {
                  type: ['string', 'null'],
                  description: 'Immer null setzen. Wird automatisch per Internetsuche ermittelt.',
                },
              },
              required: [
                'title', 'description', 'prepTime', 'cookTime',
                'servings', 'difficulty', 'tags', 'ingredients',
                'instructions',
              ],
            },
            searchQuery: {
              type: 'string',
              description: 'Suchbegriff um das Rezept im Internet zu finden (z.B. "Kartoffelsuppe vegetarisch einfach").',
            },
            reasoning: {
              type: 'string',
              description: 'Kurze Begründung, warum dieses Gericht gewählt wurde.',
            },
          },
          required: ['day', 'mealType', 'category', 'recipe', 'searchQuery', 'reasoning'],
        },
      },
    },
    required: ['weekSummary', 'shoppingEstimate', 'suggestions'],
  },
}

const singleSuggestionTool: Anthropic.Tool = {
  name: 'suggest_alternative_meal',
  description: 'Schlägt ein alternatives Rezept für eine bestimmte Mahlzeit vor.',
  input_schema: {
    type: 'object' as const,
    properties: {
      day: {
        type: 'string',
        enum: ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'],
        description: 'Wochentag als Kürzel.',
      },
      mealType: {
        type: 'string',
        enum: ['lunch', 'dinner'],
        description: 'Art der Mahlzeit.',
      },
      category: {
        type: 'string',
        enum: ['alle', 'erwachsene', 'kinder'],
        description: 'Zielgruppe der Mahlzeit.',
      },
      recipe: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          prepTime: { type: 'number' },
          cookTime: { type: 'number' },
          servings: { type: 'number' },
          difficulty: {
            type: 'string',
            enum: ['einfach', 'mittel', 'schwer'],
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          ingredients: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                quantity: { type: 'string' },
                unit: { type: 'string' },
              },
              required: ['name', 'quantity', 'unit'],
            },
          },
          instructions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                step: { type: 'number' },
                text: { type: 'string' },
              },
              required: ['step', 'text'],
            },
          },
          sourceUrl: {
            type: ['string', 'null'],
            description: 'Immer null setzen. Wird automatisch per Internetsuche ermittelt.',
          },
        },
        required: [
          'title', 'description', 'prepTime', 'cookTime',
          'servings', 'difficulty', 'tags', 'ingredients',
          'instructions',
        ],
      },
      searchQuery: {
        type: 'string',
        description: 'Suchbegriff um das Rezept im Internet zu finden (z.B. "Kartoffelsuppe vegetarisch einfach").',
      },
      reasoning: {
        type: 'string',
        description: 'Kurze Begründung für diesen Vorschlag.',
      },
    },
    required: ['day', 'mealType', 'category', 'recipe', 'searchQuery', 'reasoning'],
  },
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function generateWeeklyMealPlan(context: {
  familyPreferences: FamilyPreferences
  recentMealHistory: Recipe[]
  recentRatings: MealRating[]
  weekContext?: WeekContext
  currentSeason: string
  currentMonth: string
}): Promise<AISuggestionSet> {
  const systemPrompt = buildMealPlanSystemPrompt()
  const userPrompt = buildWeeklyPlanUserPrompt(context)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    tools: [weeklyPlanTool],
    tool_choice: { type: 'tool', name: 'create_weekly_meal_plan' },
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  // Extract the tool use result
  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  )

  if (!toolUseBlock) {
    throw new Error('KI hat kein strukturiertes Ergebnis zurückgegeben.')
  }

  const result = toolUseBlock.input as {
    weekSummary: string
    shoppingEstimate: string
    suggestions: AISuggestion[]
  }

  const suggestions = result.suggestions ?? []

  // Resolve real recipe URLs via web search (graceful: never fails the whole request)
  let resolvedSuggestions: AISuggestion[]
  try {
    resolvedSuggestions = await resolveRecipeUrls(suggestions)
  } catch (err) {
    console.warn('[generateWeeklyMealPlan] URL resolution failed, continuing without URLs:', err)
    resolvedSuggestions = suggestions
  }

  return {
    weekSummary: result.weekSummary ?? '',
    shoppingEstimate: result.shoppingEstimate ?? '',
    suggestions: resolvedSuggestions,
  }
}

export async function generateSingleAlternative(context: {
  day: string
  mealType: string
  category: string
  currentPlanSummary?: string
  excludeRecipeTitles?: string[]
  familyPreferences: FamilyPreferences
  currentSeason: string
  currentMonth: string
}): Promise<AISuggestion> {
  const systemPrompt = buildMealPlanSystemPrompt()
  const userPrompt = buildAlternativeSuggestionPrompt(context)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    tools: [singleSuggestionTool],
    tool_choice: { type: 'tool', name: 'suggest_alternative_meal' },
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  )

  if (!toolUseBlock) {
    throw new Error('KI hat kein strukturiertes Ergebnis zurückgegeben.')
  }

  const suggestion = toolUseBlock.input as AISuggestion

  // Resolve real recipe URL via web search (graceful: never fails the whole request)
  try {
    return await resolveRecipeUrl(suggestion)
  } catch (err) {
    console.warn('[generateSingleAlternative] URL resolution failed, continuing without URL:', err)
    return suggestion
  }
}
