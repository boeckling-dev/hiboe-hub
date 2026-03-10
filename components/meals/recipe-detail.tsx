import { Clock, Users, ChefHat, ExternalLink } from 'lucide-react'
import type { Recipe } from '@/lib/db/schema'
import { FoodIconBubble } from './food-icon-bubble'
import { CookidooExportButton } from './cookidoo-export-button'
import { getFoodIcon } from '@/lib/food-icon-map'
import { cn } from '@/lib/utils'

interface RecipeDetailProps {
  recipe: Recipe
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Einfach',
  medium: 'Mittel',
  hard: 'Anspruchsvoll',
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
  const { bg } = getFoodIcon(recipe.title, recipe.tags ?? undefined)

  return (
    <div className="space-y-8">
      {/* Title */}
      <h1 className="font-display font-bold text-3xl lg:text-4xl text-foreground leading-tight">
        {recipe.title}
      </h1>

      {/* Hero illustration */}
      <div className={cn('flex items-center justify-center rounded-3xl py-10', bg)}>
        <FoodIconBubble title={recipe.title} tags={recipe.tags ?? undefined} size="xl" />
      </div>

      {/* Tag pills */}
      <div className="flex flex-wrap gap-2">
        {totalTime > 0 && (
          <span className="inline-flex items-center gap-1.5 border rounded-full px-4 py-1.5 text-sm text-foreground/70">
            <Clock className="h-3.5 w-3.5" />
            {totalTime} Min
          </span>
        )}
        {recipe.servings && (
          <span className="inline-flex items-center gap-1.5 border rounded-full px-4 py-1.5 text-sm text-foreground/70">
            <Users className="h-3.5 w-3.5" />
            {recipe.servings} Portionen
          </span>
        )}
        {recipe.difficulty && (
          <span className="inline-flex items-center gap-1.5 border rounded-full px-4 py-1.5 text-sm text-foreground/70">
            <ChefHat className="h-3.5 w-3.5" />
            {DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}
          </span>
        )}
        {recipe.tags?.map(tag => (
          <span key={tag} className="inline-flex items-center border rounded-full px-4 py-1.5 text-sm text-foreground/70">
            {tag}
          </span>
        ))}
      </div>

      {/* Description */}
      {recipe.description && (
        <div>
          <h2 className="font-display font-bold text-xl text-foreground mb-2">Beschreibung</h2>
          <p className="text-foreground/70 leading-relaxed">{recipe.description}</p>
        </div>
      )}

      {/* Source URL & Cookidoo */}
      <div className="flex flex-wrap items-center gap-3">
        {recipe.recipeSource === 'cookidoo' && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-300 px-4 py-1.5 text-sm text-emerald-800">
            Cookidoo
          </span>
        )}
        {recipe.thermomixModel && (
          <span className="inline-flex items-center gap-1.5 border rounded-full px-4 py-1.5 text-sm text-foreground/70">
            {recipe.thermomixModel}
          </span>
        )}
        {recipe.sourceUrl && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border rounded-full px-4 py-1.5 text-sm text-foreground/70 hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Originalrezept
          </a>
        )}
        {!recipe.cookidooId && (
          <CookidooExportButton recipeId={recipe.id} cookidooId={recipe.cookidooId} />
        )}
      </div>

      {/* Ingredients */}
      <div>
        <h2 className="font-display font-bold text-xl text-foreground mb-4">Zutaten</h2>

        {/* Ingredient icon bubbles */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <>
            <div className="flex gap-3 overflow-x-auto pb-3 mb-4">
              {recipe.ingredients.slice(0, 8).map((ing, idx) => (
                <FoodIconBubble
                  key={idx}
                  title={ing.name}
                  size="md"
                  label={ing.name}
                />
              ))}
            </div>

            <ul className="space-y-2.5">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-baseline gap-2 text-sm">
                  <span className="font-semibold text-foreground">
                    {ing.quantity} {ing.unit}
                  </span>
                  <span className="text-foreground/70">{ing.name}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {(!recipe.ingredients || recipe.ingredients.length === 0) && (
          <p className="text-sm text-muted-foreground/60">Keine Zutaten hinterlegt</p>
        )}
      </div>

      {/* Instructions */}
      <div>
        <h2 className="font-display font-bold text-xl text-foreground mb-4">Zubereitung</h2>

        {recipe.instructions && recipe.instructions.length > 0 ? (
          <ol className="space-y-5">
            {recipe.instructions.map(inst => (
              <li key={inst.step} className="flex gap-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-meals-pastel-lavender text-sm font-display font-bold text-foreground">
                  {inst.step}
                </span>
                <p className="text-sm text-foreground/80 leading-relaxed pt-1">{inst.text}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground/60">Keine Zubereitungsschritte hinterlegt</p>
        )}
      </div>
    </div>
  )
}
