import Link from 'next/link'
import { CalendarPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'

export function EmptyPlanCta() {
  return (
    <Card className="mx-auto max-w-md overflow-hidden border-0 warm-shadow-lg">
      {/* Warm gradient header */}
      <div className="bg-gradient-to-br from-meals-highlight-soft to-amber-50 px-6 pt-8 pb-4 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-white warm-shadow">
          <span className="text-4xl animate-wiggle">🍳</span>
        </div>
      </div>

      <CardContent className="flex flex-col items-center gap-4 pb-8 pt-4 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Was kochen wir diese Woche?
          </h2>
          <p className="text-sm text-muted-foreground">
            Lass dir passende Rezepte für die ganze Familie
            vorschlagen — in wenigen Minuten!
          </p>
        </div>

        <Button asChild className="bg-meals-highlight hover:bg-meals-highlight/90 text-white rounded-xl px-6 warm-shadow-sm hover:warm-shadow transition-all">
          <Link href="/meals/planung">
            <CalendarPlus className="mr-2 size-4" />
            Jetzt planen
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
