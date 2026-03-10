import { auth } from '@clerk/nextjs/server'
import { getActiveMealPlan } from '@/lib/actions/meal-plans'
import { WeeklyPlanGrid } from '@/components/meals/weekly-plan-grid'
import { EmptyPlanCta } from '@/components/meals/empty-plan-cta'
import { MealPlanStatusBar } from '@/components/meals/meal-plan-status-bar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, BookOpen, Settings, ShoppingCart } from 'lucide-react'

export default async function MealsPage() {
  await auth.protect()
  const plan = await getActiveMealPlan()

  if (!plan) {
    return (
      <div className="space-y-6 pb-16 lg:pb-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mahlzeiten</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dein Wochenplan auf einen Blick
          </p>
        </div>

        <EmptyPlanCta />

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/meals/rezepte">
              <BookOpen className="mr-2 h-4 w-4" />
              Rezepte
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/meals/einstellungen">
              <Settings className="mr-2 h-4 w-4" />
              Einstellungen
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mahlzeiten</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dein aktiver Wochenplan
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/meals/planung">
              <Plus className="mr-2 h-4 w-4" />
              Neuer Plan
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/meals/rezepte">
              <BookOpen className="mr-2 h-4 w-4" />
              Rezepte
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/meals/einstellungen">
              <Settings className="mr-2 h-4 w-4" />
              Einstellungen
            </Link>
          </Button>
        </div>
      </div>

      <MealPlanStatusBar plan={plan} />

      <WeeklyPlanGrid plan={plan} />

      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href={`/meals/${plan.id}/einkaufsliste`}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Einkaufsliste anzeigen
          </Link>
        </Button>
      </div>
    </div>
  )
}
