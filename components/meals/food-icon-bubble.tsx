import { cn } from '@/lib/utils'
import { getFoodIcon } from '@/lib/food-icon-map'

interface FoodIconBubbleProps {
  title: string
  tags?: string[]
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  label?: string
}

const SIZES = {
  sm: { container: 'w-8 h-8 rounded-xl', icon: 'w-4 h-4' },
  md: { container: 'w-12 h-12 rounded-2xl', icon: 'w-6 h-6' },
  lg: { container: 'w-16 h-16 rounded-3xl', icon: 'w-8 h-8' },
  xl: { container: 'w-24 h-24 rounded-3xl', icon: 'w-12 h-12' },
}

export function FoodIconBubble({
  title,
  tags,
  size = 'md',
  className,
  label,
}: FoodIconBubbleProps) {
  const { icon: Icon, bg, color } = getFoodIcon(title, tags)
  const s = SIZES[size]

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <div
        className={cn(
          'flex items-center justify-center transition-transform hover:scale-105',
          s.container,
          bg
        )}
      >
        <Icon className={cn(s.icon, color)} />
      </div>
      {label && (
        <span className="text-xs font-semibold text-foreground/70 text-center line-clamp-1">
          {label}
        </span>
      )}
    </div>
  )
}
