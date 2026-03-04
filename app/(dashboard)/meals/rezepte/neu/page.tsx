import { auth } from '@clerk/nextjs/server'
import { RecipeForm } from '@/components/meals/recipe-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NeuesRezeptPage() {
  await auth.protect()

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div>
        <Link
          href="/meals/rezepte"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zu Rezepte
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Neues Rezept</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Erstelle ein neues Rezept für deine Sammlung
        </p>
      </div>

      <RecipeForm />
    </div>
  )
}
