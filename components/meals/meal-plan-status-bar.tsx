import { ChefHat, Truck, Snowflake, Clock, Leaf } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { MealPlanWithEntries } from '@/lib/types/meals'

interface MealPlanStatusBarProps {
  plan: MealPlanWithEntries
}

export function MealPlanStatusBar({ plan }: MealPlanStatusBarProps) {
  const entries = plan.entries

  // Count by meal source
  const rezeptCount = entries.filter((e) => e.mealSource === 'rezept').length
  const lieferserviceCount = entries.filter(
    (e) => e.mealSource === 'lieferservice'
  ).length
  const vorratCount = entries.filter((e) => e.mealSource === 'vorrat').length

  // Average prep time from recipes
  const recipesWithPrepTime = entries
    .filter((e) => e.recipe?.prepTime)
    .map((e) => e.recipe!.prepTime!)
  const avgPrepTime =
    recipesWithPrepTime.length > 0
      ? Math.round(
          recipesWithPrepTime.reduce((sum, t) => sum + t, 0) /
            recipesWithPrepTime.length
        )
      : 0

  // Count vegetarian meals
  const vegetarianCount = entries.filter((e) => {
    const tags = e.recipe?.tags ?? []
    return tags.some(
      (tag: string) =>
        tag.toLowerCase() === 'vegetarisch' || tag.toLowerCase() === 'vegan'
    )
  }).length

  const stats = [
    ...(rezeptCount > 0
      ? [{ icon: ChefHat, label: `${rezeptCount}x selbst kochen`, color: 'text-emerald-600', iconBg: 'bg-emerald-100' }]
      : []),
    ...(lieferserviceCount > 0
      ? [{ icon: Truck, label: `${lieferserviceCount}x Lieferservice`, color: 'text-orange-600', iconBg: 'bg-orange-100' }]
      : []),
    ...(vorratCount > 0
      ? [{ icon: Snowflake, label: `${vorratCount}x Vorrat`, color: 'text-sky-600', iconBg: 'bg-sky-100' }]
      : []),
    ...(avgPrepTime > 0
      ? [{ icon: Clock, label: `Ø ${avgPrepTime} Min.`, color: 'text-amber-600', iconBg: 'bg-amber-100' }]
      : []),
    ...(vegetarianCount > 0
      ? [{ icon: Leaf, label: `${vegetarianCount}x vegetarisch`, color: 'text-green-600', iconBg: 'bg-green-100' }]
      : []),
  ]

  if (stats.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-2 rounded-xl px-3 py-2',
            'bg-card warm-shadow-sm',
            'transition-all hover:warm-shadow hover:scale-[1.02]'
          )}
        >
          <div className={cn(
            'flex size-7 items-center justify-center rounded-lg',
            stat.iconBg
          )}>
            <stat.icon className={cn('size-4', stat.color)} />
          </div>
          <span className="text-xs font-semibold text-foreground">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  )
}
