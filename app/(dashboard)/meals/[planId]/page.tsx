import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { getMealPlanWithEntries } from '@/lib/actions/meal-plans'
import { WeeklyPlanGrid } from '@/components/meals/weekly-plan-grid'
import { MealPlanStatusBar } from '@/components/meals/meal-plan-status-bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  archived: 'Archiviert',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  archived: 'outline',
}

interface PlanDetailPageProps {
  params: Promise<{ planId: string }>
}

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
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

  const isDraft = plan.status === 'draft'
  const weekStart = new Date(plan.weekStartDate).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/meals"
            className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Übersicht
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Wochenplan</h1>
            <Badge variant={STATUS_VARIANTS[plan.status] ?? 'secondary'}>
              {STATUS_LABELS[plan.status] ?? plan.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Woche ab {weekStart}
          </p>
        </div>
      </div>

      <MealPlanStatusBar plan={plan} />

      <WeeklyPlanGrid plan={plan} editable={isDraft} />

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
