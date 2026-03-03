import Link from 'next/link'
import { Clock, ChefHat, Users } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Recipe } from '@/lib/db/schema'

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Einfach',
  medium: 'Mittel',
  hard: 'Anspruchsvoll',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  hard: 'bg-red-50 text-red-700 border-red-200',
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
      <Card
        className={cn(
          'transition-all hover:shadow-md',
          'group-focus-visible:ring-2 group-focus-visible:ring-ring'
        )}
      >
        <CardHeader className="pb-0">
          <CardTitle className="line-clamp-2 text-sm leading-snug">
            {recipe.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] font-normal"
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-normal"
                >
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {totalTime} Min.
              </span>
            )}

            {difficulty && (
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] font-medium',
                  DIFFICULTY_COLORS[difficulty]
                )}
              >
                <ChefHat className="size-3" />
                {DIFFICULTY_LABELS[difficulty] ?? difficulty}
              </Badge>
            )}

            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                {recipe.servings} Port.
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
