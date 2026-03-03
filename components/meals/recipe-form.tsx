'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createRecipe, updateRecipe } from '@/lib/actions/recipes'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import type { Recipe } from '@/lib/db/schema'

interface RecipeFormProps {
  recipe?: Recipe
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter()
  const isEditing = !!recipe

  const [title, setTitle] = useState(recipe?.title ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [prepTime, setPrepTime] = useState(recipe?.prepTime ?? 15)
  const [cookTime, setCookTime] = useState(recipe?.cookTime ?? 15)
  const [servings, setServings] = useState(recipe?.servings ?? 4)
  const [difficulty, setDifficulty] = useState(recipe?.difficulty ?? 'einfach')
  const [sourceUrl, setSourceUrl] = useState(recipe?.sourceUrl ?? '')
  const [tagsInput, setTagsInput] = useState((recipe?.tags ?? []).join(', '))
  const [ingredients, setIngredients] = useState<{ name: string; quantity: string; unit: string }[]>(
    recipe?.ingredients ?? [{ name: '', quantity: '', unit: '' }]
  )
  const [instructions, setInstructions] = useState<{ step: number; text: string }[]>(
    recipe?.instructions ?? [{ step: 1, text: '' }]
  )
  const [saving, setSaving] = useState(false)

  function addIngredient() {
    setIngredients(prev => [...prev, { name: '', quantity: '', unit: '' }])
  }

  function removeIngredient(index: number) {
    setIngredients(prev => prev.filter((_, i) => i !== index))
  }

  function updateIngredient(index: number, field: string, value: string) {
    setIngredients(prev => prev.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing
    ))
  }

  function addInstruction() {
    setInstructions(prev => [...prev, { step: prev.length + 1, text: '' }])
  }

  function removeInstruction(index: number) {
    setInstructions(prev =>
      prev.filter((_, i) => i !== index).map((inst, i) => ({ ...inst, step: i + 1 }))
    )
  }

  function updateInstruction(index: number, text: string) {
    setInstructions(prev => prev.map((inst, i) =>
      i === index ? { ...inst, text } : inst
    ))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const filteredIngredients = ingredients.filter(i => i.name.trim())
    const filteredInstructions = instructions.filter(i => i.text.trim())

    const data = {
      title,
      description: description || null,
      prepTime,
      cookTime,
      servings,
      difficulty,
      sourceUrl: sourceUrl || null,
      tags,
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
      imageUrl: recipe?.imageUrl ?? null,
    }

    try {
      if (isEditing) {
        await updateRecipe(recipe.id, data)
        router.push(`/meals/rezepte/${recipe.id}`)
      } else {
        const newRecipe = await createRecipe(data)
        router.push(`/meals/rezepte/${newRecipe.id}`)
      }
    } catch {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16 lg:pb-0">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Rezept bearbeiten' : 'Neues Rezept'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Titel *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
              placeholder="z.B. Gemüse-Nudeln mit Tomatensauce"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Beschreibung</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mt-1 flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
              placeholder="Kurze Beschreibung des Gerichts..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Zubereitungszeit</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={prepTime}
                  onChange={e => setPrepTime(Number(e.target.value))}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                />
                <span className="text-sm text-slate-500">Min</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Kochzeit</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={cookTime}
                  onChange={e => setCookTime(Number(e.target.value))}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                />
                <span className="text-sm text-slate-500">Min</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Portionen</label>
              <input
                type="number"
                min={1}
                value={servings}
                onChange={e => setServings(Number(e.target.value))}
                className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Schwierigkeit</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
              >
                <option value="einfach">Einfach</option>
                <option value="mittel">Mittel</option>
                <option value="schwer">Schwer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Tags (kommagetrennt)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
              placeholder="z.B. vegetarisch, schnell, kindgerecht"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Quell-URL</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Zutaten</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
            <Plus className="mr-1 h-4 w-4" />
            Zutat
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-slate-300 flex-shrink-0" />
              <input
                type="text"
                value={ing.quantity}
                onChange={e => updateIngredient(idx, 'quantity', e.target.value)}
                className="flex h-9 w-20 rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                placeholder="200"
              />
              <input
                type="text"
                value={ing.unit}
                onChange={e => updateIngredient(idx, 'unit', e.target.value)}
                className="flex h-9 w-16 rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                placeholder="g"
              />
              <input
                type="text"
                value={ing.name}
                onChange={e => updateIngredient(idx, 'name', e.target.value)}
                className="flex h-9 flex-1 rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                placeholder="Zutat"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeIngredient(idx)}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Zubereitung</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
            <Plus className="mr-1 h-4 w-4" />
            Schritt
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {instructions.map((inst, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="mt-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                {inst.step}
              </span>
              <textarea
                value={inst.text}
                onChange={e => updateInstruction(idx, e.target.value)}
                className="flex min-h-[60px] flex-1 rounded-md border border-slate-200 bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                placeholder={`Schritt ${inst.step}...`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeInstruction(idx)}
                className="mt-1 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving || !title.trim()}>
          {saving ? 'Speichern...' : isEditing ? 'Aktualisieren' : 'Rezept erstellen'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Abbrechen
        </Button>
      </div>
    </form>
  )
}
