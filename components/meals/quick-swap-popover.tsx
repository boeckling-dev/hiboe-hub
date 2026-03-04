'use client'

import { useState } from 'react'
import { Shuffle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { generateAlternativeSuggestion } from '@/lib/actions/ai-suggestions'
import type { AISuggestion } from '@/lib/types/meals'

import { SuggestionCard } from './suggestion-card'

interface QuickSwapPopoverProps {
  day: string
  mealType: string
  category: string
  excludeRecipeIds: number[]
  onAcceptAlternative: (suggestion: AISuggestion) => void
}

export function QuickSwapPopover({
  day,
  mealType,
  category,
  excludeRecipeIds,
  onAcceptAlternative,
}: QuickSwapPopoverProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [alternative, setAlternative] = useState<AISuggestion | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)

    if (isOpen && !alternative) {
      await fetchAlternative()
    }
  }

  async function fetchAlternative() {
    setIsLoading(true)
    setError(null)
    setAlternative(null)

    try {
      const result = await generateAlternativeSuggestion({
        day,
        mealType,
        category,
        excludeRecipeIds,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      setAlternative(result.data)
    } catch {
      setError('Fehler beim Laden der Alternative')
    } finally {
      setIsLoading(false)
    }
  }

  function handleAccept() {
    if (alternative) {
      onAcceptAlternative(alternative)
      setOpen(false)
      setAlternative(null)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Alternative vorschlagen"
        >
          <Shuffle className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3">
          <p className="mb-3 text-sm font-medium text-foreground/80">
            Alternativer Vorschlag
          </p>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/60" />
              <p className="mt-2 text-xs text-muted-foreground">
                Suche Alternative...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="space-y-2 py-4 text-center">
              <p className="text-xs text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAlternative}
              >
                Erneut versuchen
              </Button>
            </div>
          )}

          {/* Alternative suggestion */}
          {alternative && !isLoading && (
            <div className="space-y-3">
              <SuggestionCard
                suggestion={alternative}
                onAccept={handleAccept}
              />

              {/* Fetch another alternative */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={fetchAlternative}
              >
                <Shuffle className="mr-1.5 h-3 w-3" />
                Nochmal tauschen
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
