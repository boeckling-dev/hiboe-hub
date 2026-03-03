'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
      <Button
        variant="outline"
        className={cn(
          'flex h-full min-h-16 w-full items-center justify-center',
          'border-dashed border-muted-foreground/30',
          'text-muted-foreground hover:border-primary/50 hover:text-primary'
        )}
        onClick={onAddMeal}
        aria-label="Mahlzeit hinzufügen"
      >
        <Plus className="size-4" />
      </Button>
    )
  }

  // Empty, non-editable state
  return (
    <div
      className={cn(
        'flex min-h-16 items-center justify-center rounded-lg',
        'bg-muted/30 text-muted-foreground/40'
      )}
    >
      <span className="text-xs">--</span>
    </div>
  )
}
