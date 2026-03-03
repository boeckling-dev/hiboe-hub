'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChefHat,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  PartyPopper,
  Utensils,
  CalendarDays,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import {
  DAYS,
  DAY_LABELS_SHORT,
  CATEGORY_LABELS,
  type Category,
  type AISuggestionSet,
  type WeekContext,
} from '@/lib/types/meals'
import type {
  MealPlanWithEntries,
} from '@/lib/types/meals'
import type { ShoppingListItem } from '@/lib/db/schema'

import { generateWeeklySuggestions, generateAlternativeSuggestion } from '@/lib/actions/ai-suggestions'
import { createMealPlan, activateMealPlan, getMealPlanWithEntries } from '@/lib/actions/meal-plans'
import { bulkCreateEntries } from '@/lib/actions/meal-plan-entries'
import { generateShoppingList } from '@/lib/actions/shopping-list'
import { createRecipe } from '@/lib/actions/recipes'

import { PlanningStepIndicator } from './planning-step-indicator'
import { SuggestionCard } from './suggestion-card'
import { WeeklyPlanGrid } from './weekly-plan-grid'
import { ShoppingList } from './shopping-list'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STEP_LABELS = [
  'Was steht an?',
  'Vorschläge',
  'Anpassen',
  'Einkaufsliste',
  'Fertig!',
]

function getNextMonday(): Date {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ...
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek
  const nextMonday = new Date(today)
  nextMonday.setDate(today.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0)
  return nextMonday
}

function formatDateRange(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const formatDay = (d: Date) =>
    d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })

  return `${formatDay(monday)} – ${formatDay(sunday)}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlanningWizard() {
  const router = useRouter()

  // Step management
  const [currentStep, setCurrentStep] = useState(0)

  // Step 0: Context
  const [eatingOutDays, setEatingOutDays] = useState<string[]>([])
  const [specialEvents, setSpecialEvents] = useState('')
  const [leftovers, setLeftovers] = useState('')

  // Step 1: Suggestions
  const [suggestions, setSuggestions] = useState<AISuggestionSet | null>(null)
  const [acceptedIndices, setAcceptedIndices] = useState<Set<number>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  // Step 2: Adjust plan
  const [planId, setPlanId] = useState<number | null>(null)
  const [plan, setPlan] = useState<MealPlanWithEntries | null>(null)
  const [isCreatingPlan, startCreatePlan] = useTransition()

  // Step 3: Shopping list
  const [shoppingItems, setShoppingItems] = useState<ShoppingListItem[]>([])
  const [isLoadingShopping, startLoadingShopping] = useTransition()

  // Step 4: Finish
  const [isActivating, startActivating] = useTransition()
  const [activated, setActivated] = useState(false)

  const weekStartDate = getNextMonday()

  // ── Step 0: Toggle eating out days ──

  function toggleEatingOutDay(day: string) {
    setEatingOutDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  // ── Step 1: Generate suggestions ──

  useEffect(() => {
    if (currentStep === 1 && !suggestions && !isGenerating) {
      handleGenerateSuggestions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  async function handleGenerateSuggestions() {
    setIsGenerating(true)
    setGenerateError(null)

    const weekContext: WeekContext = {}
    if (specialEvents.trim()) {
      weekContext.specialEvents = specialEvents
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    }
    if (eatingOutDays.length > 0) {
      weekContext.eatingOutDays = eatingOutDays
    }
    if (leftovers.trim()) {
      weekContext.leftoversFromLastWeek = leftovers
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    }

    try {
      const result = await generateWeeklySuggestions({
        weekStartDate,
        weekContext:
          Object.keys(weekContext).length > 0 ? weekContext : undefined,
      })
      setSuggestions(result)
      // Auto-accept all suggestions initially
      setAcceptedIndices(new Set(result.suggestions.map((_, i) => i)))
    } catch (err) {
      setGenerateError(
        err instanceof Error
          ? err.message
          : 'Fehler beim Erstellen der Vorschläge'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  function toggleAccepted(index: number) {
    setAcceptedIndices((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  function acceptAll() {
    if (!suggestions) return
    setAcceptedIndices(new Set(suggestions.suggestions.map((_, i) => i)))
  }

  async function handleReplaceSuggestion(index: number) {
    if (!suggestions) return
    const s = suggestions.suggestions[index]

    try {
      const alternative = await generateAlternativeSuggestion({
        day: s.day,
        mealType: s.mealType,
        category: s.category,
        excludeRecipeIds: [],
      })

      setSuggestions((prev) => {
        if (!prev) return prev
        const updated = [...prev.suggestions]
        updated[index] = alternative
        return { ...prev, suggestions: updated }
      })
    } catch {
      // Silently fail - user can try again
    }
  }

  // ── Step 2: Create draft plan and entries ──

  useEffect(() => {
    if (currentStep === 2 && !planId && suggestions) {
      handleCreatePlan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  function handleCreatePlan() {
    startCreatePlan(async () => {
      try {
        if (!suggestions) return

        // Create the meal plan
        const newPlan = await createMealPlan(weekStartDate)
        setPlanId(newPlan.id)

        // Create recipes for accepted suggestions, then bulk-create entries
        const acceptedSuggestions = suggestions.suggestions.filter((_, i) =>
          acceptedIndices.has(i)
        )

        const entryData = await Promise.all(
          acceptedSuggestions.map(async (s) => {
            const recipe = await createRecipe({
              title: s.recipe.title,
              description: s.recipe.description,
              prepTime: s.recipe.prepTime,
              cookTime: s.recipe.cookTime,
              servings: s.recipe.servings,
              difficulty: s.recipe.difficulty,
              tags: s.recipe.tags,
              ingredients: s.recipe.ingredients,
              instructions: s.recipe.instructions,
              sourceUrl: s.recipe.sourceUrl,
              imageUrl: null,
            })

            return {
              day: s.day,
              mealType: s.mealType,
              category: s.category,
              recipeId: recipe.id,
              mealSource: 'rezept' as const,
              customMealNote: null,
              deliveryServiceName: null,
              vorratNote: null,
            }
          })
        )

        if (entryData.length > 0) {
          await bulkCreateEntries(newPlan.id, entryData)
        }

        // Fetch the full plan with entries
        const fullPlan = await getMealPlanWithEntries(newPlan.id)
        if (fullPlan) {
          setPlan(fullPlan)
        }
      } catch {
        // Error handling - stay on step
      }
    })
  }

  // ── Step 3: Generate shopping list ──

  useEffect(() => {
    if (currentStep === 3 && planId && shoppingItems.length === 0) {
      handleGenerateShoppingList()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  function handleGenerateShoppingList() {
    if (!planId) return
    startLoadingShopping(async () => {
      try {
        const items = await generateShoppingList(planId)
        setShoppingItems(items)
      } catch {
        // Error handling
      }
    })
  }

  // ── Step 4: Activate plan ──

  function handleActivate() {
    if (!planId) return
    startActivating(async () => {
      try {
        await activateMealPlan(planId)
        setActivated(true)
        setTimeout(() => {
          router.push('/meals')
        }, 2500)
      } catch {
        // Error handling
      }
    })
  }

  // ── Navigation ──

  function goNext() {
    if (currentStep < 4) setCurrentStep((s) => s + 1)
  }

  function goBack() {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  // ── Computed values for Step 4 ──

  const acceptedCount = acceptedIndices.size
  const categoryBreakdown = suggestions
    ? suggestions.suggestions
        .filter((_, i) => acceptedIndices.has(i))
        .reduce(
          (acc, s) => {
            const cat = s.category as Category
            acc[cat] = (acc[cat] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        )
    : {}

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Step Indicator */}
      <PlanningStepIndicator currentStep={currentStep} steps={STEP_LABELS} />

      {/* ── Step 0: Was steht an? ── */}
      {currentStep === 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5" />
                Wochenplanung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Week date range */}
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Planung für die Woche
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatDateRange(weekStartDate)}
                </p>
              </div>

              {/* Eating out days */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  An welchen Tagen esst ihr auswärts?
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleEatingOutDay(day)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        eatingOutDays.includes(day)
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {DAY_LABELS_SHORT[day]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special events */}
              <div>
                <label
                  htmlFor="special-events"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Gibt es Besonderes diese Woche?
                </label>
                <Textarea
                  id="special-events"
                  value={specialEvents}
                  onChange={(e) => setSpecialEvents(e.target.value)}
                  placeholder="z.B. Geburtstag am Mittwoch, Gäste am Samstag..."
                  rows={3}
                />
              </div>

              {/* Leftovers */}
              <div>
                <label
                  htmlFor="leftovers"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Reste von letzter Woche?
                </label>
                <Textarea
                  id="leftovers"
                  value={leftovers}
                  onChange={(e) => setLeftovers(e.target.value)}
                  placeholder="z.B. Reis vom Sonntag, halber Blumenkohl..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-end">
            <Button onClick={goNext}>
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 1: Vorschläge ── */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-16">
              <ChefHat className="h-12 w-12 animate-bounce text-slate-400" />
              <p className="mt-4 text-lg font-medium text-slate-600">
                Plane wird erstellt...
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Die KI stellt den perfekten Wochenplan zusammen
              </p>
            </div>
          )}

          {generateError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm text-red-700">{generateError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleGenerateSuggestions}
                >
                  Erneut versuchen
                </Button>
              </CardContent>
            </Card>
          )}

          {suggestions && !isGenerating && (
            <>
              {/* Week summary from AI */}
              {suggestions.weekSummary && (
                <Card className="border-slate-200 bg-slate-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-700">
                      {suggestions.weekSummary}
                    </p>
                    {suggestions.shoppingEstimate && (
                      <p className="mt-1 text-xs text-slate-500">
                        Geschätzte Einkaufskosten: {suggestions.shoppingEstimate}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Accept all button */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {acceptedIndices.size} von {suggestions.suggestions.length}{' '}
                  Vorschlägen akzeptiert
                </p>
                <Button variant="outline" size="sm" onClick={acceptAll}>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Alle akzeptieren
                </Button>
              </div>

              {/* Suggestions grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {suggestions.suggestions.map((suggestion, index) => (
                  <SuggestionCard
                    key={`${suggestion.day}-${suggestion.mealType}-${suggestion.category}-${index}`}
                    suggestion={suggestion}
                    accepted={acceptedIndices.has(index)}
                    onAccept={() => toggleAccepted(index)}
                    onReject={() => {
                      setAcceptedIndices((prev) => {
                        const next = new Set(prev)
                        next.delete(index)
                        return next
                      })
                    }}
                    onRequestAlternative={() => handleReplaceSuggestion(index)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button
              onClick={goNext}
              disabled={isGenerating || acceptedIndices.size === 0}
            >
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Anpassen ── */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {isCreatingPlan && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <p className="mt-4 text-sm text-slate-600">
                Plan wird erstellt...
              </p>
            </div>
          )}

          {plan && !isCreatingPlan && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Wochenplan anpassen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Verschiebe, tausche oder entferne Mahlzeiten nach Bedarf.
                  </p>
                  <WeeklyPlanGrid plan={plan} editable />
                </CardContent>
              </Card>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button onClick={goNext} disabled={isCreatingPlan || !plan}>
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Einkaufsliste ── */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {isLoadingShopping && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <p className="mt-4 text-sm text-slate-600">
                Einkaufsliste wird erstellt...
              </p>
            </div>
          )}

          {!isLoadingShopping && planId && (
            <ShoppingList items={shoppingItems} mealPlanId={planId} />
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button onClick={goNext} disabled={isLoadingShopping}>
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Fertig! ── */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {/* Confetti CSS animation on activation */}
          {activated && (
            <style>{`
              @keyframes confetti-fall {
                0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
              }
              .confetti-piece {
                position: fixed;
                top: 0;
                animation: confetti-fall 3s ease-in forwards;
                z-index: 50;
                pointer-events: none;
              }
            `}</style>
          )}
          {activated &&
            Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1.5}s`,
                  width: `${8 + Math.random() * 8}px`,
                  height: `${8 + Math.random() * 8}px`,
                  backgroundColor: [
                    '#f43f5e',
                    '#8b5cf6',
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ec4899',
                  ][Math.floor(Math.random() * 6)],
                  borderRadius: Math.random() > 0.5 ? '50%' : '0',
                }}
              />
            ))}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {activated ? (
                  <PartyPopper className="h-5 w-5 text-amber-500" />
                ) : (
                  <Utensils className="h-5 w-5" />
                )}
                {activated ? 'Plan aktiviert!' : 'Zusammenfassung'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activated && (
                <p className="text-sm text-emerald-700">
                  Dein Wochenplan ist jetzt aktiv. Du wirst gleich
                  weitergeleitet...
                </p>
              )}

              {!activated && (
                <>
                  {/* Plan summary */}
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Mahlzeiten
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {acceptedCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Woche</p>
                        <p className="text-sm font-medium text-slate-900">
                          {formatDateRange(weekStartDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Category breakdown */}
                  {Object.keys(categoryBreakdown).length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-700">
                        Aufschlüsselung nach Kategorie
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(categoryBreakdown).map(
                          ([cat, count]) => (
                            <Badge key={cat} variant="secondary">
                              {CATEGORY_LABELS[cat as Category]}: {count}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Shopping items count */}
                  {shoppingItems.length > 0 && (
                    <p className="text-sm text-slate-600">
                      {shoppingItems.length} Artikel auf der Einkaufsliste
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            {!activated && (
              <Button variant="outline" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
            )}
            {!activated && (
              <Button
                onClick={handleActivate}
                disabled={isActivating || !planId}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird aktiviert...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Plan aktivieren
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
