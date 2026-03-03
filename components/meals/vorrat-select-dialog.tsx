'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { upsertMealPlanEntry } from '@/lib/actions/meal-plan-entries'
import { Snowflake, X } from 'lucide-react'

interface VorratSelectDialogProps {
  entryId?: number
  mealPlanId: number
  day: string
  mealType: string
  category: string
  onClose: () => void
  onConfirm: () => void
}

export function VorratSelectDialog({
  entryId,
  mealPlanId,
  day,
  mealType,
  category,
  onClose,
  onConfirm,
}: VorratSelectDialogProps) {
  const [vorratNote, setVorratNote] = useState('')
  const [saving, setSaving] = useState(false)

  const suggestions = [
    'Tiefgefrorene Lasagne',
    'Eingekochtes Gulasch',
    'Tiefkühl-Pizza',
    'Reste vom Vortag',
    'Suppe aus dem Gefrierer',
  ]

  async function handleConfirm() {
    if (!vorratNote.trim()) return

    setSaving(true)

    await upsertMealPlanEntry({
      id: entryId,
      mealPlanId,
      day,
      mealType,
      category,
      mealSource: 'vorrat',
      vorratNote: vorratNote.trim(),
      recipeId: null,
      customMealNote: null,
      deliveryServiceName: null,
    })

    setSaving(false)
    onConfirm()
  }

  return (
    <Card className="border-sky-200">
      <CardHeader className="relative pb-3">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
        <CardTitle className="flex items-center gap-2 text-base">
          <Snowflake className="h-5 w-5 text-sky-500" />
          Aus dem Vorrat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <Button
              key={s}
              type="button"
              variant={vorratNote === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVorratNote(s)}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* Custom input */}
        <div>
          <label className="text-xs font-medium text-slate-500">Oder eigene Beschreibung</label>
          <input
            type="text"
            value={vorratNote}
            onChange={e => setVorratNote(e.target.value)}
            className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
            placeholder="Was holst du aus dem Vorrat?"
          />
        </div>

        <Button
          onClick={handleConfirm}
          disabled={saving || !vorratNote.trim()}
          className="w-full bg-sky-600 hover:bg-sky-700"
        >
          {saving ? 'Wird gespeichert...' : 'Eintragen'}
        </Button>
      </CardContent>
    </Card>
  )
}
