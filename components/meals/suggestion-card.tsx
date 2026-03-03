'use client'

import { Check, X, Shuffle, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  DAY_LABELS,
  MEAL_TYPE_LABELS,
  type Category,
  type Day,
  type MealType,
} from '@/lib/types/meals'
import type { AISuggestion } from '@/lib/types/meals'

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Einfach',
  medium: 'Mittel',
  hard: 'Anspruchsvoll',
}

interface SuggestionCardProps {
  suggestion: AISuggestion
  onAccept?: () => void
  onReject?: () => void
  onRequestAlternative?: () => void
  accepted?: boolean
}

export function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
  onRequestAlternative,
  accepted = false,
}: SuggestionCardProps) {
  const { recipe, reasoning, day, mealType, category } = suggestion
  const colors = CATEGORY_COLORS[category as Category]
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
  const keyIngredients = recipe.ingredients.slice(0, 5)

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all',
        accepted && 'ring-2 ring-emerald-500 border-emerald-300'
      )}
    >
      {/* Accepted overlay indicator */}
      {accepted && (
        <div className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}

      <CardContent className="p-4">
        {/* Day + Meal type header */}
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">
            {DAY_LABELS[day as Day]} &middot; {MEAL_TYPE_LABELS[mealType as MealType]}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold leading-tight text-slate-900">
          {recipe.title}
        </h3>

        {/* Description */}
        {recipe.description && (
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Meta row: time, category badge, difficulty */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {totalTime > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{totalTime} Min.</span>
            </div>
          )}

          <Badge
            variant="outline"
            className={cn('text-[10px]', colors.bg, colors.text, colors.border)}
          >
            {CATEGORY_LABELS[category as Category]}
          </Badge>

          {recipe.difficulty && (
            <Badge variant="secondary" className="text-[10px]">
              {DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}
            </Badge>
          )}
        </div>

        {/* Key ingredients */}
        {keyIngredients.length > 0 && (
          <div className="mt-3">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Hauptzutaten
            </p>
            <div className="flex flex-wrap gap-1">
              {keyIngredients.map((ing) => (
                <span
                  key={ing.name}
                  className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600"
                >
                  {ing.name}
                </span>
              ))}
              {recipe.ingredients.length > 5 && (
                <span className="text-xs text-slate-400">
                  +{recipe.ingredients.length - 5} weitere
                </span>
              )}
            </div>
          </div>
        )}

        {/* AI reasoning */}
        {reasoning && (
          <p className="mt-3 text-xs italic text-slate-500 line-clamp-2">
            {reasoning}
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex items-center gap-2">
          {onAccept && (
            <Button
              size="sm"
              variant={accepted ? 'default' : 'outline'}
              onClick={onAccept}
              className={cn(
                'flex-1',
                accepted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
              )}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              {accepted ? 'Akzeptiert' : 'Akzeptieren'}
            </Button>
          )}

          {onRequestAlternative && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRequestAlternative}
              aria-label="Alternative vorschlagen"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </Button>
          )}

          {onReject && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              className="border-red-200 text-red-600 hover:bg-red-50"
              aria-label="Vorschlag ablehnen"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
