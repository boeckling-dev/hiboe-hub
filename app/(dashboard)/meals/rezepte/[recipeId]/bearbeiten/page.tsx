import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { getRecipe } from '@/lib/actions/recipes'
import { RecipeForm } from '@/components/meals/recipe-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface RezeptBearbeitenPageProps {
  params: Promise<{ recipeId: string }>
}

export default async function RezeptBearbeitenPage({ params }: RezeptBearbeitenPageProps) {
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
      <div>
        <Link
          href={`/meals/rezepte/${recipe.id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Rezept
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Rezept bearbeiten</h1>
        <p className="mt-1 text-sm text-slate-500">
          {recipe.title}
        </p>
      </div>

      <RecipeForm recipe={recipe} />
    </div>
  )
}
