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
        'relative overflow-hidden rounded-2xl transition-all duration-200',
        'hover:warm-shadow hover:scale-[1.01]',
        accepted && 'ring-2 ring-meals-success border-meals-success/30'
      )}
    >
      {/* Accepted overlay indicator */}
      {accepted && (
        <div className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-meals-success text-white warm-shadow-sm animate-pop">
          <Check className="h-4 w-4" />
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
        <h3 className="text-base font-semibold leading-tight text-foreground">
          {recipe.title}
        </h3>

        {/* Description */}
        {recipe.description && (
          <p className="mt-1 text-sm text-foreground/70 line-clamp-2">
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
                  className="rounded-lg bg-meals-surface px-2 py-0.5 text-xs text-foreground/70"
                >
                  {ing.name}
                </span>
              ))}
              {recipe.ingredients.length > 5 && (
                <span className="text-xs text-muted-foreground/60">
                  +{recipe.ingredients.length - 5} weitere
                </span>
              )}
            </div>
          </div>
        )}

        {/* AI reasoning */}
        {reasoning && (
          <p className="mt-3 text-xs italic text-muted-foreground line-clamp-2">
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
                'flex-1 rounded-xl',
                accepted
                  ? 'bg-meals-success hover:bg-meals-success/90 text-white'
                  : 'border-meals-success/50 text-meals-success hover:bg-meals-success-soft'
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
              className="rounded-xl"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </Button>
          )}

          {onReject && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
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
