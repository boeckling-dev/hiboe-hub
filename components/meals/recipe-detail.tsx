import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Clock, Users, ChefHat, ExternalLink } from 'lucide-react'
import type { Recipe } from '@/lib/db/schema'

interface RecipeDetailProps {
  recipe: Recipe
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{recipe.title}</h1>
        {recipe.description && (
          <p className="mt-2 text-slate-600">{recipe.description}</p>
        )}
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        {totalTime > 0 && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{totalTime} Min</span>
            {recipe.prepTime && recipe.cookTime ? (
              <span className="text-slate-400">
                ({recipe.prepTime} + {recipe.cookTime})
              </span>
            ) : null}
          </div>
        )}
        {recipe.servings && (
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} Portionen</span>
          </div>
        )}
        {recipe.difficulty && (
          <div className="flex items-center gap-1.5">
            <ChefHat className="h-4 w-4" />
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Source URL */}
      {recipe.sourceUrl && (
        <a
          href={recipe.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="h-4 w-4" />
          Originalrezept
        </a>
      )}

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ingredients */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Zutaten</CardTitle>
          </CardHeader>
          <CardContent>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-baseline gap-2 text-sm">
                    <span className="font-medium text-slate-900">
                      {ing.quantity} {ing.unit}
                    </span>
                    <span className="text-slate-600">{ing.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Keine Zutaten hinterlegt</p>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Zubereitung</CardTitle>
          </CardHeader>
          <CardContent>
            {recipe.instructions && recipe.instructions.length > 0 ? (
              <ol className="space-y-4">
                {recipe.instructions.map(inst => (
                  <li key={inst.step} className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                      {inst.step}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{inst.text}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-400">Keine Zubereitungsschritte hinterlegt</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
