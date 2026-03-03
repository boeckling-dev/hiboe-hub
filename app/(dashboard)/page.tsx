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
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Willkommen im Family Hub</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href={plan ? '/meals/heute' : '/meals'}>
          <Card className="transition-colors hover:border-amber-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <UtensilsCrossed className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-sm font-medium text-slate-500">Heute kochen</CardTitle>
            </CardHeader>
            <CardContent>
              {todayEntries.length > 0 ? (
                <div>
                  {todayEntries.map(entry => (
                    <div key={entry.id} className="flex items-center gap-2">
                      <ChefHat className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {entry.recipe?.title || entry.customMealNote || entry.deliveryServiceName || entry.vorratNote || 'Mahlzeit'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-slate-900">–</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {plan ? 'Heute nichts geplant' : 'Kein aktiver Wochenplan'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/meals">
          <Card className="transition-colors hover:border-slate-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Calendar className="h-5 w-5 text-slate-400" />
              <CardTitle className="text-sm font-medium text-slate-500">Wochenplan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{totalMeals > 0 ? `${totalMeals} Mahlzeiten` : '–'}</p>
              <p className="mt-1 text-xs text-slate-500">
                {plan ? `KW ${getWeekNumber(plan.weekStartDate)}` : 'Noch kein Plan erstellt'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Package className="h-5 w-5 text-slate-400" />
            <CardTitle className="text-sm font-medium text-slate-500">Inventar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">–</p>
            <p className="mt-1 text-xs text-slate-500">Keine Items erfasst</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Building2 className="h-5 w-5 text-slate-400" />
            <CardTitle className="text-sm font-medium text-slate-500">Immobilien</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">–</p>
            <p className="mt-1 text-xs text-slate-500">Keine Objekte bewertet</p>
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
