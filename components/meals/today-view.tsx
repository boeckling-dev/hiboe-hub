'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CategoryIndicator } from '@/components/meals/category-indicator'
import { MealSourceBadge } from '@/components/meals/meal-source-badge'
import { MealRatingDialog } from '@/components/meals/meal-rating-dialog'
import { DeliveryOrderDialog } from '@/components/meals/delivery-order-dialog'
import { Clock, ChefHat, ExternalLink, Truck, UtensilsCrossed } from 'lucide-react'
import type { MealPlanEntryWithRecipe, MealType, Category } from '@/lib/types/meals'
import { MEAL_TYPE_LABELS } from '@/lib/types/meals'
import Link from 'next/link'

interface TodayViewProps {
  entries: MealPlanEntryWithRecipe[]
  mealPlanId: number
  deliveryServices?: { name: string; url?: string }[]
}

export function TodayView({ entries, mealPlanId, deliveryServices = [] }: TodayViewProps) {
  const [ratingEntry, setRatingEntry] = useState<MealPlanEntryWithRecipe | null>(null)
  const [showDelivery, setShowDelivery] = useState(false)

  const today = new Date()
  const dayNames = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa']
  const todayDay = dayNames[today.getDay()]

  const todayEntries = entries.filter(e => e.day === todayDay)
  const lunchEntry = todayEntries.find(e => e.mealType === 'lunch')
  const dinnerEntry = todayEntries.find(e => e.mealType === 'dinner')

  const dateFormatted = today.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  function renderMealCard(entry: MealPlanEntryWithRecipe | undefined, mealType: MealType) {
    if (!entry) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground/60">Keine Mahlzeit geplant</p>
          </CardContent>
        </Card>
      )
    }

    const totalTime = entry.recipe
      ? (entry.recipe.prepTime || 0) + (entry.recipe.cookTime || 0)
      : 0

    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {MEAL_TYPE_LABELS[mealType]}
            </CardTitle>
            <div className="flex items-center gap-2">
              <CategoryIndicator category={entry.category as Category} />
              <MealSourceBadge source={entry.mealSource as 'rezept' | 'lieferservice' | 'vorrat'} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {entry.recipe?.title || entry.customMealNote || entry.deliveryServiceName || entry.vorratNote || 'Mahlzeit'}
            </h3>
            {entry.recipe?.description && (
              <p className="mt-1 text-sm text-foreground/70">{entry.recipe.description}</p>
            )}
          </div>

          {totalTime > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{totalTime} Min</span>
              </div>
              {entry.recipe?.difficulty && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {entry.recipe.difficulty}
                </Badge>
              )}
            </div>
          )}

          {/* Key ingredients preview */}
          {entry.recipe?.ingredients && entry.recipe.ingredients.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Hauptzutaten</p>
              <div className="flex flex-wrap gap-1">
                {entry.recipe.ingredients.slice(0, 6).map((ing, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {ing.name}
                  </Badge>
                ))}
                {entry.recipe.ingredients.length > 6 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground/60">
                    +{entry.recipe.ingredients.length - 6}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {entry.recipe && (
              <Link href={`/meals/rezepte/${entry.recipe.id}`}>
                <Button size="sm">
                  <ChefHat className="mr-1.5 h-4 w-4" />
                  Jetzt kochen
                </Button>
              </Link>
            )}
            {entry.recipe?.sourceUrl && (
              <a href={entry.recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  Originalrezept
                </Button>
              </a>
            )}
            {entry.recipe && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRatingEntry(entry)}
              >
                Bewerten
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Heute kochen</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dateFormatted}</p>
      </div>

      {todayEntries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="mx-auto h-12 w-12 text-muted-foreground/25" />
            <p className="mt-4 text-muted-foreground">Für heute ist nichts geplant</p>
            <Link href="/meals" className="mt-4 inline-block">
              <Button variant="outline" size="sm">Zum Wochenplan</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {renderMealCard(lunchEntry, 'lunch')}
          {renderMealCard(dinnerEntry, 'dinner')}
        </div>
      )}

      <Separator />

      {/* "Zu müde?" section */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">😴</span>
              <div>
                <p className="font-medium text-foreground">Zu müde zum Kochen?</p>
                <p className="text-sm text-muted-foreground">Kein Problem, bestell was!</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDelivery(true)}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Truck className="mr-1.5 h-4 w-4" />
              Bestellen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delivery dialog */}
      {showDelivery && (
        <DeliveryOrderDialog
          mealPlanId={mealPlanId}
          day={todayDay}
          mealType="dinner"
          category="alle"
          entryId={dinnerEntry?.id}
          deliveryServices={deliveryServices}
          onClose={() => setShowDelivery(false)}
          onConfirm={() => {
            setShowDelivery(false)
            window.location.reload()
          }}
        />
      )}

      {/* Rating dialog */}
      {ratingEntry && ratingEntry.recipe && (
        <MealRatingDialog
          recipeId={ratingEntry.recipe.id}
          recipeTitle={ratingEntry.recipe.title}
          mealPlanEntryId={ratingEntry.id}
          onClose={() => setRatingEntry(null)}
        />
      )}
    </div>
  )
}
