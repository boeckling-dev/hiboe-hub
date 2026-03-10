'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Download, Loader2, Check, FolderOpen, ChefHat } from 'lucide-react'
import {
  searchCookidooRecipes,
  getCookidooCollections,
  getCookidooCollectionRecipes,
  importCookidooRecipes,
} from '@/lib/actions/cookidoo'
import type { CookidooRecipe, CookidooCollection } from '@/lib/cookidoo/types'

export function CookidooImport() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [recipes, setRecipes] = useState<CookidooRecipe[]>([])
  const [collections, setCollections] = useState<CookidooCollection[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [loadingCollections, setLoadingCollections] = useState(false)

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    setError(null)
    setImportResult(null)

    const result = await searchCookidooRecipes(searchQuery.trim())
    if (result.success) {
      setRecipes(result.data)
    } else {
      setError(result.error)
    }
    setSearching(false)
  }

  async function handleLoadCollections() {
    setLoadingCollections(true)
    setError(null)

    const result = await getCookidooCollections()
    if (result.success) {
      setCollections(result.data)
    } else {
      setError(result.error)
    }
    setLoadingCollections(false)
  }

  async function handleSelectCollection(collectionId: string) {
    setActiveCollection(collectionId)
    setSearching(true)
    setError(null)

    const result = await getCookidooCollectionRecipes(collectionId)
    if (result.success) {
      setRecipes(result.data)
    } else {
      setError(result.error)
    }
    setSearching(false)
  }

  function toggleRecipe(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selectedIds.size === recipes.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(recipes.map(r => r.id)))
    }
  }

  async function handleImport() {
    if (selectedIds.size === 0) return
    setImporting(true)
    setError(null)
    setImportResult(null)

    const result = await importCookidooRecipes(Array.from(selectedIds))
    if (result.success) {
      setImportResult(result.data)
      setSelectedIds(new Set())
    } else {
      setError(result.error)
    }
    setImporting(false)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            In Cookidoo suchen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex h-9 flex-1 rounded-md border border-border bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meals-highlight/30"
              placeholder="z.B. Kartoffelsuppe, Risotto..."
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Collections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Meine Sammlungen
          </CardTitle>
          {collections.length === 0 && (
            <Button variant="outline" size="sm" onClick={handleLoadCollections} disabled={loadingCollections}>
              {loadingCollections ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
              Sammlungen laden
            </Button>
          )}
        </CardHeader>
        {collections.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {collections.map((collection) => (
                <Button
                  key={collection.id}
                  variant={activeCollection === collection.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSelectCollection(collection.id)}
                  className="rounded-full"
                >
                  {collection.name} ({collection.recipeCount})
                </Button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
          <Check className="mr-2 inline-block h-4 w-4" />
          {importResult.imported} Rezept(e) importiert
          {importResult.skipped > 0 && `, ${importResult.skipped} bereits vorhanden`}
        </div>
      )}

      {/* Recipe List */}
      {recipes.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Gefundene Rezepte ({recipes.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedIds.size === recipes.length ? 'Keine' : 'Alle'} ausw&auml;hlen
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                disabled={importing || selectedIds.size === 0}
              >
                {importing ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-1 h-4 w-4" />
                )}
                {selectedIds.size} importieren
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recipes.map((recipe) => (
                <label
                  key={recipe.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(recipe.id)}
                    onChange={() => toggleRecipe(recipe.id)}
                    className="h-4 w-4 rounded border-border"
                  />
                  {recipe.imageUrl && (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{recipe.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {recipe.totalTime && (
                        <span>{Math.round(recipe.totalTime / 60)} Min.</span>
                      )}
                      {recipe.servings && (
                        <span>{recipe.servings} Portionen</span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
