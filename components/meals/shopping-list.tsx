'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toggleShoppingItem, addShoppingItem, removeShoppingItem } from '@/lib/actions/shopping-list'
import { Check, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ShoppingListItem } from '@/lib/db/schema'
import { SHOPPING_CATEGORIES } from '@/lib/types/meals'

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
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">
                {checkedCount} von {totalCount} erledigt
              </span>
            </div>
            <span className="text-slate-500">{progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
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
          className="flex h-9 flex-1 rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
          placeholder="Zutat hinzufügen..."
        />
        <Button type="submit" size="sm" disabled={!newItem.trim()}>
          <Plus className="mr-1 h-4 w-4" />
          Hinzufügen
        </Button>
      </form>

      {/* Items by category */}
      {sortedCategories.map(category => {
        const categoryItems = grouped.get(category)!
        const categoryChecked = categoryItems.filter(i => i.checked).length

        return (
          <Card key={category}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {category}
                </CardTitle>
                <span className="text-xs text-slate-400">
                  {categoryChecked}/{categoryItems.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {categoryItems.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors',
                    item.checked && 'opacity-50'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(item.id)}
                    className={cn(
                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors',
                      item.checked
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 hover:border-slate-400'
                    )}
                  >
                    {item.checked && <Check className="h-3 w-3" />}
                  </button>
                  <span className={cn(
                    'flex-1 text-sm',
                    item.checked && 'line-through text-slate-400'
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
                    className="text-slate-300 hover:text-red-500 transition-colors"
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
          <ShoppingCart className="mx-auto h-12 w-12 text-slate-200" />
          <p className="mt-4 text-sm text-slate-400">Noch keine Einkaufsliste erstellt</p>
        </div>
      )}
    </div>
  )
}
