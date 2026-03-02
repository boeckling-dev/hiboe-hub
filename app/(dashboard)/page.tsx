import { auth } from '@clerk/nextjs/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UtensilsCrossed, Package, Building2 } from 'lucide-react'

export default async function DashboardPage() {
  await auth.protect()

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Willkommen im Family Hub</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <UtensilsCrossed className="h-5 w-5 text-slate-400" />
            <CardTitle className="text-sm font-medium text-slate-500">Mahlzeiten</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">–</p>
            <p className="mt-1 text-xs text-slate-500">Kein aktiver Wochenplan</p>
          </CardContent>
        </Card>

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
