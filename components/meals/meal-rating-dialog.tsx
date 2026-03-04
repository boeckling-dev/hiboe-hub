'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { rateMeal } from '@/lib/actions/meal-ratings'
import { ThumbsUp, ThumbsDown, Baby, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MealRatingDialogProps {
  recipeId: number
  recipeTitle: string
  mealPlanEntryId?: number
  onClose: () => void
}

export function MealRatingDialog({
  recipeId,
  recipeTitle,
  mealPlanEntryId,
  onClose,
}: MealRatingDialogProps) {
  const [rating, setRating] = useState<1 | 2 | null>(null)
  const [kidsLikedIt, setKidsLikedIt] = useState<boolean | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit() {
    if (!rating) return
    setSaving(true)

    await rateMeal({
      recipeId,
      mealPlanEntryId,
      rating,
      kidsLikedIt: kidsLikedIt ?? undefined,
      note: note.trim() || undefined,
    })

    setSaved(true)
    setTimeout(onClose, 1500)
  }

  if (saved) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="py-6 text-center">
          <p className="font-medium text-emerald-700">Danke für dein Feedback!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="relative space-y-4 pt-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground/60 hover:text-foreground/70"
        >
          <X className="h-4 w-4" />
        </button>

        <div>
          <p className="text-sm text-muted-foreground">Wie war&apos;s?</p>
          <p className="font-medium text-foreground">{recipeTitle}</p>
        </div>

        {/* Rating buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setRating(2)}
            className={cn(
              'flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
              rating === 2
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-border hover:border-emerald-300'
            )}
          >
            <ThumbsUp className={cn('h-6 w-6', rating === 2 ? 'text-emerald-600' : 'text-muted-foreground/60')} />
            <span className="text-sm font-medium">Lecker!</span>
          </button>
          <button
            type="button"
            onClick={() => setRating(1)}
            className={cn(
              'flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
              rating === 1
                ? 'border-red-500 bg-red-50'
                : 'border-border hover:border-red-300'
            )}
          >
            <ThumbsDown className={cn('h-6 w-6', rating === 1 ? 'text-red-600' : 'text-muted-foreground/60')} />
            <span className="text-sm font-medium">Nicht so</span>
          </button>
        </div>

        {/* Kids liked it? */}
        {rating && (
          <div className="space-y-2">
            <p className="text-sm text-foreground/70">
              <Baby className="mr-1 inline h-4 w-4" />
              Hat es den Kindern geschmeckt?
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={kidsLikedIt === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => setKidsLikedIt(true)}
              >
                Ja
              </Button>
              <Button
                type="button"
                variant={kidsLikedIt === false ? 'default' : 'outline'}
                size="sm"
                onClick={() => setKidsLikedIt(false)}
              >
                Nein
              </Button>
              <Button
                type="button"
                variant={kidsLikedIt === null ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setKidsLikedIt(null)}
              >
                Nicht relevant
              </Button>
            </div>
          </div>
        )}

        {/* Note */}
        {rating && (
          <div>
            <label className="text-sm text-foreground/70">Anmerkung (optional)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meals-highlight/30"
              placeholder="z.B. zu salzig, zu scharf..."
            />
          </div>
        )}

        {/* Submit */}
        {rating && (
          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? 'Speichern...' : 'Bewertung speichern'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
