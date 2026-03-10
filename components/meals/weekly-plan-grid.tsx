'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'
import {
  DAYS,
  MEAL_TYPES,
  DAY_LABELS_SHORT,
  DAY_LABELS,
  MEAL_TYPE_LABELS,
  DAY_EMOJIS,
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

function getTodayDay(): Day | null {
  const dayMap = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'] as const
  return dayMap[new Date().getDay()] as Day
}

const MEAL_TYPE_EMOJIS: Record<MealType, string> = {
  lunch: '🍝',
  dinner: '🌙',
}

const DAY_BG: Record<Day, string> = {
  mo: 'bg-day-mo',
  di: 'bg-day-di',
  mi: 'bg-day-mi',
  do: 'bg-day-do',
  fr: 'bg-day-fr',
  sa: 'bg-day-sa',
  so: 'bg-day-so',
}

export function WeeklyPlanGrid({
  plan,
  editable = false,
}: WeeklyPlanGridProps) {
  const [activeDay, setActiveDay] = useState<Day>('mo')
  const today = getTodayDay()

  return (
    <>
      {/* ── Desktop: 7-column grid ── */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-7 gap-3">
          {/* Day headers */}
          {DAYS.map((day) => {
            const isToday = day === today
            return (
              <div
                key={day}
                className={cn(
                  'rounded-2xl px-2 py-2.5 text-center transition-all',
                  isToday
                    ? 'bg-foreground text-white warm-shadow-sm'
                    : DAY_BG[day]
                )}
              >
                <span className="text-base">{DAY_EMOJIS[day]}</span>
                <p className={cn(
                  'text-sm font-display font-bold',
                  isToday ? 'text-white' : 'text-foreground/70'
                )}>
                  {DAY_LABELS_SHORT[day]}
                </p>
                {isToday && (
                  <span className="text-[10px] font-medium text-white/80">
                    Heute
                  </span>
                )}
              </div>
            )
          })}

          {/* Rows per meal type */}
          {MEAL_TYPES.map((mealType) => (
            <>
              {DAYS.map((day) => {
                const entry = getEntry(plan, day, mealType)
                return (
                  <div key={`${day}-${mealType}`} className="min-h-20">
                    {day === 'mo' && (
                      <div className="mb-1.5 flex items-center gap-1 text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>{MEAL_TYPE_EMOJIS[mealType]}</span>
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
        {/* Day tabs — pill-style */}
        <div className="mb-5 flex gap-1.5 overflow-x-auto p-1">
          {DAYS.map((day) => {
            const isToday = day === today
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-full px-3.5 py-2.5 text-sm transition-all',
                  'font-display font-bold',
                  activeDay === day
                    ? 'bg-foreground text-white warm-shadow-sm scale-105'
                    : isToday
                      ? 'bg-meals-highlight-soft text-meals-highlight'
                      : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <span className="text-sm">{DAY_EMOJIS[day]}</span>
                <span>{DAY_LABELS_SHORT[day]}</span>
              </button>
            )
          })}
        </div>

        {/* Active day heading */}
        <h3 className="mb-4 flex items-center gap-2 font-display font-bold text-2xl text-foreground">
          <span>{DAY_EMOJIS[activeDay]}</span>
          {DAY_LABELS[activeDay]}
        </h3>

        {/* Meal slots for active day */}
        <div className="space-y-4">
          {MEAL_TYPES.map((mealType) => {
            const entry = getEntry(plan, activeDay, mealType)
            return (
              <div key={mealType}>
                <div className="mb-1.5 flex items-center gap-1 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>{MEAL_TYPE_EMOJIS[mealType]}</span>
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
