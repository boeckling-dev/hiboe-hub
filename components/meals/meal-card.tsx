'use client'

import { Clock, Shuffle, Trash2, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CATEGORY_COLORS, type Category } from '@/lib/types/meals'
import type { MealPlanEntryWithRecipe } from '@/lib/types/meals'

import { CategoryIndicator } from './category-indicator'
import { MealSourceBadge } from './meal-source-badge'

interface MealCardProps {
  entry: MealPlanEntryWithRecipe
  editable?: boolean
  onSwap?: () => void
  onRemove?: () => void
  onRate?: () => void
}

export function MealCard({
  entry,
  editable = false,
  onSwap,
  onRemove,
  onRate,
}: MealCardProps) {
  const category = entry.category as Category
  const colors = CATEGORY_COLORS[category]

  const hasRecipe = entry.recipe !== null && entry.mealSource === 'rezept'
  const isDelivery = entry.mealSource === 'lieferservice'
  const isVorrat = entry.mealSource === 'vorrat'

  const title = hasRecipe
    ? entry.recipe!.title
    : isDelivery
      ? entry.deliveryServiceName ?? 'Lieferservice'
      : isVorrat
        ? entry.vorratNote ?? 'Aus dem Vorrat'
        : entry.customMealNote ?? 'Mahlzeit'

  return (
    <div
      className={cn(
        'group relative rounded-lg border p-2',
        'transition-shadow hover:shadow-sm',
        colors.border,
        colors.bg
      )}
    >
      {/* Header row: title + action buttons */}
      <div className="flex items-start justify-between gap-1">
        <p
          className={cn(
            'line-clamp-2 text-xs font-semibold leading-tight',
            colors.text
          )}
          title={title}
        >
          {title}
        </p>

        {editable && (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            {onSwap && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onSwap}
                aria-label="Mahlzeit tauschen"
              >
                <Shuffle className="size-3" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onRemove}
                aria-label="Mahlzeit entfernen"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Meta row */}
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <CategoryIndicator category={category} />
        <MealSourceBadge source={entry.mealSource as 'rezept' | 'lieferservice' | 'vorrat'} />
      </div>

      {/* Prep time (only for recipes) */}
      {hasRecipe && entry.recipe!.prepTime && (
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="size-3" />
          <span>{entry.recipe!.prepTime} Min.</span>
        </div>
      )}

      {/* Custom note for recipe entries */}
      {hasRecipe && entry.customMealNote && (
        <p className="mt-1 line-clamp-1 text-[10px] italic text-muted-foreground">
          {entry.customMealNote}
        </p>
      )}

      {/* Rate button (non-editable mode, e.g., after cooking) */}
      {!editable && onRate && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onRate}
          aria-label="Mahlzeit bewerten"
          className="absolute right-1 bottom-1 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Star className="size-3" />
        </Button>
      )}
    </div>
  )
}
