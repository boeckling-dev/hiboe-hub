import { auth } from '@clerk/nextjs/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UtensilsCrossed, Package, Building2, ChefHat, Calendar } from 'lucide-react'
import { getActiveMealPlan } from '@/lib/actions/meal-plans'
import Link from 'next/link'

export default async function DashboardPage() {
  await auth.protect()
  const plan = await getActiveMealPlan()

  // Compute today's meals
  const today = new Date()
  const dayNames = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa']
  const todayDay = dayNames[today.getDay()]
  const todayEntries = plan?.entries.filter(e => e.day === todayDay) ?? []
  const totalMeals = plan?.entries.length ?? 0

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Willkommen im Family Hub</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href={plan ? '/meals/heute' : '/meals'}>
          <Card className="relative overflow-hidden transition-all hover:warm-shadow hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 to-transparent pointer-events-none" />
            <CardHeader className="relative flex flex-row items-center gap-3 pb-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100">
                <UtensilsCrossed className="h-5 w-5 text-amber-600" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Heute kochen</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {todayEntries.length > 0 ? (
                <div>
                  {todayEntries.map(entry => (
                    <div key={entry.id} className="flex items-center gap-2">
                      <ChefHat className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <p className="text-sm font-medium text-foreground truncate">
                        {entry.recipe?.title || entry.customMealNote || entry.deliveryServiceName || entry.vorratNote || 'Mahlzeit'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-foreground">–</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan ? 'Heute nichts geplant' : 'Kein aktiver Wochenplan'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/meals">
          <Card className="relative overflow-hidden transition-all hover:warm-shadow hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/60 to-transparent pointer-events-none" />
            <CardHeader className="relative flex flex-row items-center gap-3 pb-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-teal-100">
                <Calendar className="h-5 w-5 text-teal-600" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Wochenplan</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-2xl font-bold text-foreground">{totalMeals > 0 ? `${totalMeals} Mahlzeiten` : '–'}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {plan ? `KW ${getWeekNumber(plan.weekStartDate)}` : 'Noch kein Plan erstellt'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="relative overflow-hidden transition-all hover:warm-shadow hover:scale-[1.01]">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-transparent pointer-events-none" />
          <CardHeader className="relative flex flex-row items-center gap-3 pb-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-violet-100">
              <Package className="h-5 w-5 text-violet-600" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventar</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-2xl font-bold text-foreground">–</p>
            <p className="mt-1 text-xs text-muted-foreground">Keine Items erfasst</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:warm-shadow hover:scale-[1.01]">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent pointer-events-none" />
          <CardHeader className="relative flex flex-row items-center gap-3 pb-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-rose-100">
              <Building2 className="h-5 w-5 text-rose-600" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Immobilien</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-2xl font-bold text-foreground">–</p>
            <p className="mt-1 text-xs text-muted-foreground">Keine Objekte bewertet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
