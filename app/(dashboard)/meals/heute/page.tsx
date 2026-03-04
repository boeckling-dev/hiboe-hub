import { auth } from '@clerk/nextjs/server'
import { getActiveMealPlan } from '@/lib/actions/meal-plans'
import { getFamilyPreferences } from '@/lib/actions/family-preferences'
import { TodayView } from '@/components/meals/today-view'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

export default async function HeutePage() {
  await auth.protect()

  const plan = await getActiveMealPlan()

  if (!plan) {
    return (
      <div className="space-y-6 pb-16 lg:pb-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Heute kochen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Was gibt es heute zu essen?
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="mx-auto h-12 w-12 text-muted-foreground/25" />
            <p className="mt-4 text-muted-foreground">
              Kein aktiver Wochenplan vorhanden
            </p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              Erstelle zuerst einen Wochenplan, um deine Mahlzeiten zu sehen.
            </p>
            <Link href="/meals/planung" className="mt-4 inline-block">
              <Button>Wochenplan erstellen</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const preferences = await getFamilyPreferences()
  const deliveryServices = (preferences.deliveryServices as { name: string; url?: string }[]) ?? []

  return (
    <TodayView
      entries={plan.entries}
      mealPlanId={plan.id}
      deliveryServices={deliveryServices}
    />
  )
}
