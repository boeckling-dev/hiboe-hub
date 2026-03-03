import { auth } from '@clerk/nextjs/server'
import { getRecipes } from '@/lib/actions/recipes'
import { RecipeCardCompact } from '@/components/meals/recipe-card-compact'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, BookOpen } from 'lucide-react'

export default async function RezeptePage() {
  await auth.protect()
  const recipes = await getRecipes()

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rezepte</h1>
          <p className="mt-1 text-sm text-slate-500">
            Deine gesammelten Rezepte
          </p>
        </div>

        <Button asChild>
          <Link href="/meals/rezepte/neu">
            <Plus className="mr-2 h-4 w-4" />
            Neues Rezept
          </Link>
        </Button>
      </div>

      {recipes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-200" />
            <p className="mt-4 text-slate-500">
              Noch keine Rezepte vorhanden
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Erstelle dein erstes Rezept, um loszulegen.
            </p>
            <Link href="/meals/rezepte/neu" className="mt-4 inline-block">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Rezept erstellen
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCardCompact key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
