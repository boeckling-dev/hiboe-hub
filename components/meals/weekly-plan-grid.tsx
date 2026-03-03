'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'
import {
  DAYS,
  MEAL_TYPES,
  DAY_LABELS_SHORT,
  DAY_LABELS,
  MEAL_TYPE_LABELS,
  type Day,
  type MealType,
} from '@/lib/types/meals'
import type { MealPlanWithEntries } from '@/lib/types/meals'

import { MealSlot } from './meal-slot'

interface WeeklyPlanGridProps {
  plan: MealPlanWithEntries
  editable?: boolean
}

function getEntry(
  plan: MealPlanWithEntries,
  day: Day,
  mealType: MealType
) {
  return plan.entries.find(
    (e) => e.day === day && e.mealType === mealType
  )
}

export function WeeklyPlanGrid({
  plan,
  editable = false,
}: WeeklyPlanGridProps) {
  const [activeDay, setActiveDay] = useState<Day>('mo')

  return (
    <>
      {/* ── Desktop: 7-column grid ── */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {DAYS.map((day) => (
            <div
              key={day}
              className="pb-2 text-center text-sm font-semibold text-muted-foreground"
            >
              {DAY_LABELS_SHORT[day]}
            </div>
          ))}

          {/* Rows per meal type */}
          {MEAL_TYPES.map((mealType) => (
            <>
              {/* Row label spans all columns (shown inline) */}
              {DAYS.map((day) => {
                const entry = getEntry(plan, day, mealType)
                return (
                  <div key={`${day}-${mealType}`} className="min-h-20">
                    {/* Meal type label on first column */}
                    {day === 'mo' && (
                      <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {MEAL_TYPE_LABELS[mealType]}
                      </div>
                    )}
                    <MealSlot
                      day={day}
                      mealType={mealType}
                      entry={entry}
                      editable={editable}
                    />
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>

      {/* ── Mobile: Single day with tab switching ── */}
      <div className="block lg:hidden">
        {/* Day tabs */}
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={cn(
                'flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                activeDay === day
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {DAY_LABELS_SHORT[day]}
            </button>
          ))}
        </div>

        {/* Active day heading */}
        <h3 className="mb-3 text-base font-semibold">
          {DAY_LABELS[activeDay]}
        </h3>

        {/* Meal slots for active day */}
        <div className="space-y-3">
          {MEAL_TYPES.map((mealType) => {
            const entry = getEntry(plan, activeDay, mealType)
            return (
              <div key={mealType}>
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {MEAL_TYPE_LABELS[mealType]}
                </div>
                <MealSlot
                  day={activeDay}
                  mealType={mealType}
                  entry={entry}
                  editable={editable}
                />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
