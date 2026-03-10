'use client'

import { Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Day, MealType } from '@/lib/types/meals'
import type { MealPlanEntryWithRecipe } from '@/lib/types/meals'

import { MealCard } from './meal-card'

interface MealSlotProps {
  day: Day
  mealType: MealType
  entry?: MealPlanEntryWithRecipe
  editable?: boolean
  onAddMeal?: () => void
  onSwap?: () => void
  onRemove?: () => void
}

export function MealSlot({
  entry,
  editable = false,
  onAddMeal,
  onSwap,
  onRemove,
}: MealSlotProps) {
  if (entry) {
    return (
      <MealCard
        entry={entry}
        editable={editable}
        onSwap={onSwap}
        onRemove={onRemove}
      />
    )
  }

  if (editable) {
    return (
      <button
        onClick={onAddMeal}
        aria-label="Mahlzeit hinzufügen"
        className={cn(
          'flex h-full min-h-16 w-full flex-col items-center justify-center gap-1',
          'rounded-2xl border-2 border-dashed border-meals-highlight/25',
          'bg-meals-highlight-soft/30',
          'text-meals-highlight/50 transition-all duration-200',
          'hover:border-meals-highlight/50 hover:bg-meals-highlight-soft/60',
          'hover:text-meals-highlight hover:scale-[1.02]',
          'active:scale-[0.98]'
        )}
      >
        <Plus className="size-5" />
        <span className="text-[10px] font-medium">Hinzufügen</span>
      </button>
    )
  }

  // Empty, non-editable state
  return (
    <div
      className={cn(
        'flex min-h-16 items-center justify-center rounded-2xl',
        'bg-muted/20 text-muted-foreground/30'
      )}
    >
      <span className="text-lg">🍽️</span>
    </div>
  )
}
