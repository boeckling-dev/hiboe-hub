'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, Check, ExternalLink } from 'lucide-react'
import { exportRecipeToCookidoo } from '@/lib/actions/cookidoo'

interface CookidooExportButtonProps {
  recipeId: number
  cookidooId?: string | null
}

export function CookidooExportButton({ recipeId, cookidooId }: CookidooExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [exported, setExported] = useState(Boolean(cookidooId))
  const [cookidooUrl, setCookidooUrl] = useState(
    cookidooId ? `https://cookidoo.de/recipes/recipe/de-DE/${cookidooId}` : null,
  )
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setExporting(true)
    setError(null)

    const result = await exportRecipeToCookidoo(recipeId)
    if (result.success) {
      setExported(true)
      setCookidooUrl(result.data.cookidooUrl)
    } else {
      setError(result.error)
    }
    setExporting(false)
  }

  if (exported && cookidooUrl) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={cookidooUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 border rounded-full px-4 py-1.5 text-sm text-foreground/70 hover:bg-muted transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          In Cookidoo &ouml;ffnen
        </a>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
          <Check className="h-3 w-3" />
          Auf Thermomix verf&uuml;gbar
        </span>
      </div>
    )
  }

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={exporting}
        className="rounded-full"
      >
        {exporting ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="mr-1.5 h-3.5 w-3.5" />
        )}
        Nach Cookidoo exportieren
      </Button>
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
