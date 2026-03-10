'use client'

import { Check, X, Shuffle, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CATEGORY_LABELS,
  DAY_LABELS,
  MEAL_TYPE_LABELS,
  type Category,
  type Day,
  type MealType,
} from '@/lib/types/meals'
import type { AISuggestion } from '@/lib/types/meals'

import { FoodIconBubble } from './food-icon-bubble'

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
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
  const keyIngredients = recipe.ingredients.slice(0, 5)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border bg-card p-5 transition-all duration-200',
        'hover:warm-shadow hover:scale-[1.01]',
        accepted && 'ring-2 ring-meals-success border-meals-success/30'
      )}
    >
      {/* Accepted overlay indicator */}
      {accepted && (
        <div className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-meals-success text-white warm-shadow-sm animate-pop">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Food icon centered */}
      <div className="flex justify-center mb-4">
        <FoodIconBubble
          title={recipe.title}
          tags={recipe.tags}
          size="lg"
        />
      </div>

      {/* Day + Meal type header */}
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-display font-semibold">
          {DAY_LABELS[day as Day]} &middot; {MEAL_TYPE_LABELS[mealType as MealType]}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-lg leading-tight text-foreground">
        {recipe.title}
      </h3>

      {/* Description */}
      {recipe.description && (
        <p className="mt-1.5 text-sm text-foreground/70 line-clamp-2">
          {recipe.description}
        </p>
      )}

      {/* Meta row: outlined pills */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {recipe.recipeSource === 'cookidoo' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-300 px-3 py-1 text-xs text-emerald-800">
            Cookidoo
          </span>
        )}

        {totalTime > 0 && (
          <span className="inline-flex items-center gap-1 border rounded-full px-3 py-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {totalTime} Min.
          </span>
        )}

        <span className="inline-flex items-center border rounded-full px-3 py-1 text-xs text-muted-foreground">
          {CATEGORY_LABELS[category as Category]}
        </span>

        {recipe.difficulty && (
          <span className="inline-flex items-center border rounded-full px-3 py-1 text-xs text-muted-foreground">
            {DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}
          </span>
        )}
      </div>

      {/* Key ingredients */}
      {keyIngredients.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground">
            Hauptzutaten
          </p>
          <div className="flex flex-wrap gap-1.5">
            {keyIngredients.map((ing) => (
              <span
                key={ing.name}
                className="rounded-full border px-2.5 py-0.5 text-xs text-foreground/70"
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
            onClick={onAccept}
            className={cn(
              'flex-1 rounded-full font-display font-semibold',
              accepted
                ? 'bg-meals-success hover:bg-meals-success/90 text-white'
                : 'bg-foreground hover:bg-foreground/90 text-white'
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
            className="rounded-full"
          >
            <Shuffle className="h-3.5 w-3.5" />
          </Button>
        )}

        {onReject && (
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/5"
            aria-label="Vorschlag ablehnen"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
