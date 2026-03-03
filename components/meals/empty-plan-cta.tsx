import Link from 'next/link'
import { CalendarPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'

export function EmptyPlanCta() {
  return (
    <Card className="mx-auto max-w-md border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <CalendarPlus className="size-8 text-primary" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            Wochenplan erstellen
          </h2>
          <p className="text-sm text-muted-foreground">
            Plane jetzt deine Woche und lass dir passende Rezepte
            vorschlagen.
          </p>
        </div>

        <Button asChild>
          <Link href="/meals/planung">Jetzt planen</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
