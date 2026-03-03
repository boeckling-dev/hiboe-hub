'use client'

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WeekNavigationProps {
  weekStartDate: Date
  onPreviousWeek?: () => void
  onNextWeek?: () => void
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function formatDateRange(start: Date): string {
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ]

  const startDay = start.getDate()
  const endDay = end.getDate()
  const startMonth = months[start.getMonth()]
  const endMonth = months[end.getMonth()]
  const endYear = end.getFullYear()

  if (start.getMonth() === end.getMonth()) {
    return `${startDay}. - ${endDay}. ${endMonth} ${endYear}`
  }

  return `${startDay}. ${startMonth} - ${endDay}. ${endMonth} ${endYear}`
}

export function WeekNavigation({
  weekStartDate,
  onPreviousWeek,
  onNextWeek,
}: WeekNavigationProps) {
  const weekNumber = getISOWeekNumber(weekStartDate)
  const dateRange = formatDateRange(weekStartDate)

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onPreviousWeek}
        aria-label="Vorherige Woche"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <span className={cn('text-lg font-bold tracking-tight')}>
            KW {weekNumber}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">{dateRange}</span>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onNextWeek}
        aria-label="Nächste Woche"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
