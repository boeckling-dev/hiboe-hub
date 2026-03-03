import { Users, Wine, Baby } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type Category,
} from '@/lib/types/meals'

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  alle: Users,
  erwachsene: Wine,
  kinder: Baby,
}

interface CategoryIndicatorProps {
  category: Category
}

export function CategoryIndicator({ category }: CategoryIndicatorProps) {
  const colors = CATEGORY_COLORS[category]
  const label = CATEGORY_LABELS[category]
  const Icon = CATEGORY_ICONS[category]

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 text-[10px] font-medium',
        colors.bg,
        colors.border,
        colors.text
      )}
    >
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
