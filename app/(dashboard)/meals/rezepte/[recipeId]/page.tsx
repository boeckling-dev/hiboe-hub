import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { getRecipe } from '@/lib/actions/recipes'
import { RecipeDetail } from '@/components/meals/recipe-detail'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { DeleteRecipeButton } from './delete-recipe-button'

interface RezeptDetailPageProps {
  params: Promise<{ recipeId: string }>
}

export default async function RezeptDetailPage({ params }: RezeptDetailPageProps) {
  await auth.protect()

  const { recipeId } = await params
  const id = parseInt(recipeId, 10)

  if (isNaN(id)) {
    notFound()
  }

  const recipe = await getRecipe(id)

  if (!recipe) {
    notFound()
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/meals/rezepte"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zu Rezepte
        </Link>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/meals/rezepte/${recipe.id}/bearbeiten`}>
              <Pencil className="mr-2 h-4 w-4" />
              Bearbeiten
            </Link>
          </Button>
          <DeleteRecipeButton recipeId={recipe.id} />
        </div>
      </div>

      <RecipeDetail recipe={recipe} />
    </div>
  )
}
