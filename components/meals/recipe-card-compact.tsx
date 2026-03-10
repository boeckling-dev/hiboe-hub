import Link from 'next/link'
import { Clock, ChefHat, Users } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Recipe } from '@/lib/db/schema'
import { FoodIconBubble } from './food-icon-bubble'

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Einfach',
  medium: 'Mittel',
  hard: 'Anspruchsvoll',
}

interface RecipeCardCompactProps {
  recipe: Recipe
}

export function RecipeCardCompact({ recipe }: RecipeCardCompactProps) {
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0)
  const tags = recipe.tags ?? []
  const difficulty = recipe.difficulty ?? 'easy'

  return (
    <Link href={`/meals/rezepte/${recipe.id}`} className="group block">
      <div
        className={cn(
          'rounded-3xl border bg-card p-5 transition-all',
          'hover:warm-shadow hover:scale-[1.02]',
          'group-focus-visible:ring-2 group-focus-visible:ring-ring'
        )}
      >
        {/* Icon bubble */}
        <div className="mb-3">
          <FoodIconBubble title={recipe.title} tags={tags} size="lg" />
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-base leading-snug line-clamp-2 text-foreground">
          {recipe.title}
        </h3>

        {/* Tags as pills */}
        {tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="border rounded-full px-2.5 py-0.5 text-[11px] text-foreground/60"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="border rounded-full px-2.5 py-0.5 text-[11px] text-foreground/60">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta info as pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {totalTime > 0 && (
            <span className="inline-flex items-center gap-1 border rounded-full px-2.5 py-1">
              <Clock className="size-3" />
              {totalTime} Min.
            </span>
          )}

          {difficulty && (
            <span className="inline-flex items-center gap-1 border rounded-full px-2.5 py-1">
              <ChefHat className="size-3" />
              {DIFFICULTY_LABELS[difficulty] ?? difficulty}
            </span>
          )}

          {recipe.servings && (
            <span className="inline-flex items-center gap-1 border rounded-full px-2.5 py-1">
              <Users className="size-3" />
              {recipe.servings} Port.
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
