import { Truck, Snowflake } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MealSource } from '@/lib/types/meals'

interface MealSourceBadgeProps {
  source: MealSource
}

export function MealSourceBadge({ source }: MealSourceBadgeProps) {
  if (source === 'rezept') {
    return null
  }

  if (source === 'lieferservice') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'gap-1 text-[10px] font-medium',
          'border-orange-200 bg-orange-50 text-orange-700'
        )}
      >
        <Truck className="size-3" />
        Lieferservice
      </Badge>
    )
  }

  // vorrat
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 text-[10px] font-medium',
        'border-sky-200 bg-sky-50 text-sky-700'
      )}
    >
      <Snowflake className="size-3" />
      Vorrat
    </Badge>
  )
}
