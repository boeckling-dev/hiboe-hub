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

  // Count vegetarian meals (tagged with 'vegetarisch' or 'vegan')
  const vegetarianCount = entries.filter((e) => {
    const tags = e.recipe?.tags ?? []
    return tags.some(
      (tag: string) =>
        tag.toLowerCase() === 'vegetarisch' || tag.toLowerCase() === 'vegan'
    )
  }).length

  const stats = [
    ...(rezeptCount > 0
      ? [{ icon: ChefHat, label: `${rezeptCount}x selbst kochen`, color: 'text-emerald-600' }]
      : []),
    ...(lieferserviceCount > 0
      ? [{ icon: Truck, label: `${lieferserviceCount}x Lieferservice`, color: 'text-orange-600' }]
      : []),
    ...(vorratCount > 0
      ? [{ icon: Snowflake, label: `${vorratCount}x Vorrat`, color: 'text-sky-600' }]
      : []),
    ...(avgPrepTime > 0
      ? [{ icon: Clock, label: `\u00D8 ${avgPrepTime} Min.`, color: 'text-muted-foreground' }]
      : []),
    ...(vegetarianCount > 0
      ? [{ icon: Leaf, label: `${vegetarianCount}x vegetarisch`, color: 'text-green-600' }]
      : []),
  ]

  if (stats.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={cn('flex items-center gap-1 text-xs font-medium', stat.color)}
        >
          <stat.icon className="size-3.5" />
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
