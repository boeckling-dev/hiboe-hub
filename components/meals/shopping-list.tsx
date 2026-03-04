'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toggleShoppingItem, addShoppingItem, removeShoppingItem } from '@/lib/actions/shopping-list'
import { Check, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ShoppingListItem } from '@/lib/db/schema'
import { SHOPPING_CATEGORIES, SHOPPING_CATEGORY_EMOJIS } from '@/lib/types/meals'

interface ShoppingListProps {
  items: ShoppingListItem[]
  mealPlanId: number
}

export function ShoppingList({ items: initialItems, mealPlanId }: ShoppingListProps) {
  const [items, setItems] = useState(initialItems)
  const [newItem, setNewItem] = useState('')
  const [, startTransition] = useTransition()

  const checkedCount = items.filter(i => i.checked).length
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  // Group items by category
  const grouped = new Map<string, ShoppingListItem[]>()
  for (const item of items) {
    const cat = item.category || 'Sonstiges'
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(item)
  }

  // Sort categories by predefined order
  const sortedCategories = [...grouped.keys()].sort((a, b) => {
    const idxA = SHOPPING_CATEGORIES.indexOf(a as typeof SHOPPING_CATEGORIES[number])
    const idxB = SHOPPING_CATEGORIES.indexOf(b as typeof SHOPPING_CATEGORIES[number])
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB)
  })

  function handleToggle(itemId: number) {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i))
    startTransition(async () => {
      await toggleShoppingItem(itemId)
    })
  }

  function handleRemove(itemId: number) {
    setItems(prev => prev.filter(i => i.id !== itemId))
    startTransition(async () => {
      await removeShoppingItem(itemId)
    })
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newItem.trim()) return

    const result = await addShoppingItem({
      mealPlanId,
      ingredient: newItem.trim(),
    })

    setItems(prev => [...prev, result])
    setNewItem('')
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card className="warm-shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-meals-highlight" />
              <span className="font-medium text-foreground">
                {checkedCount} von {totalCount} erledigt
              </span>
            </div>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-meals-surface">
            <div
              className="h-full rounded-full bg-gradient-to-r from-meals-highlight to-meals-success transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add item */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          className="flex h-9 flex-1 rounded-xl border border-border bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meals-highlight/30"
          placeholder="Zutat hinzufügen..."
        />
        <Button type="submit" size="sm" disabled={!newItem.trim()} className="rounded-xl">
          <Plus className="mr-1 h-4 w-4" />
          Hinzufügen
        </Button>
      </form>

      {/* Items by category */}
      {sortedCategories.map(category => {
        const categoryItems = grouped.get(category)!
        const categoryChecked = categoryItems.filter(i => i.checked).length

        return (
          <Card key={category} className="warm-shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground/70">
                  <span className="mr-1.5">{SHOPPING_CATEGORY_EMOJIS[category] ?? '🛒'}</span>
                  {category}
                </CardTitle>
                <span className="text-xs text-muted-foreground/60">
                  {categoryChecked}/{categoryItems.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {categoryItems.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all',
                    item.checked && 'opacity-50'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(item.id)}
                    className={cn(
                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all',
                      item.checked
                        ? 'border-meals-success bg-meals-success text-white scale-110'
                        : 'border-muted-foreground/30 hover:border-meals-highlight/50'
                    )}
                  >
                    {item.checked && <Check className="h-3 w-3" />}
                  </button>
                  <span className={cn(
                    'flex-1 text-sm',
                    item.checked && 'line-through text-muted-foreground/60'
                  )}>
                    {item.quantity && item.unit
                      ? `${item.quantity} ${item.unit} ${item.ingredient}`
                      : item.quantity
                        ? `${item.quantity} ${item.ingredient}`
                        : item.ingredient}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      {totalCount === 0 && (
        <div className="py-12 text-center">
          <span className="text-5xl">🛒</span>
          <p className="mt-4 text-sm text-muted-foreground">
            Noch keine Einkaufsliste — starte mit der Wochenplanung!
          </p>
        </div>
      )}
    </div>
  )
}
