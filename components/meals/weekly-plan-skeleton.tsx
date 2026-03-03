import { Skeleton } from '@/components/ui/skeleton'

export function WeeklyPlanSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Status bar */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Grid - Desktop */}
      <div className="hidden lg:block">
        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-6 rounded" />
          ))}
        </div>
        {/* Lunch row */}
        <div className="mb-2 grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        {/* Dinner row */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Grid - Mobile */}
      <div className="lg:hidden space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  )
}
