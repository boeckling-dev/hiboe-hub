import { Skeleton } from '@/components/ui/skeleton'

export default function MealsLoading() {
  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Status bar */}
      <Skeleton className="h-6 w-72" />

      {/* Desktop grid skeleton */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="mx-auto h-5 w-8" />
          ))}
          {/* Meal slots (2 rows x 7 cols) */}
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={`slot-${i}`} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Mobile skeleton */}
      <div className="block lg:hidden">
        <Skeleton className="mb-4 h-10 w-full rounded-lg" />
        <Skeleton className="mb-3 h-6 w-24" />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>

      {/* Bottom button */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-52" />
      </div>
    </div>
  )
}
