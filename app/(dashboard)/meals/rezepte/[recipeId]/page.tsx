import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { getRecipe } from '@/lib/actions/recipes'
import { RecipeDetail } from '@/components/meals/recipe-detail'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Pencil, Heart, Share2 } from 'lucide-react'
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
      {/* Top bar — Dribbble-inspired */}
      <div className="flex items-center justify-between">
        <Link
          href="/meals/rezepte"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full border bg-card hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href={`/meals/rezepte/${recipe.id}/bearbeiten`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Share2 className="h-4 w-4" />
          </Button>
          <DeleteRecipeButton recipeId={recipe.id} />
        </div>
      </div>

      <RecipeDetail recipe={recipe} />
    </div>
  )
}
