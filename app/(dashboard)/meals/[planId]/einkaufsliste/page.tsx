import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { getMealPlanWithEntries } from '@/lib/actions/meal-plans'
import { getShoppingList, generateShoppingList } from '@/lib/actions/shopping-list'
import { ShoppingList } from '@/components/meals/shopping-list'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface EinkaufslistePageProps {
  params: Promise<{ planId: string }>
}

export default async function EinkaufslistePage({ params }: EinkaufslistePageProps) {
  await auth.protect()

  const { planId } = await params
  const id = parseInt(planId, 10)

  if (isNaN(id)) {
    notFound()
  }

  const plan = await getMealPlanWithEntries(id)

  if (!plan) {
    notFound()
  }

  let items = await getShoppingList(id)

  // Automatically generate shopping list if none exists yet
  if (items.length === 0 && plan.entries.length > 0) {
    items = await generateShoppingList(id)
  }

  const weekStart = new Date(plan.weekStartDate).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div>
        <Link
          href={`/meals/${plan.id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Wochenplan
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Einkaufsliste</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Woche ab {weekStart}
        </p>
      </div>

      <ShoppingList items={items} mealPlanId={id} />
    </div>
  )
}
