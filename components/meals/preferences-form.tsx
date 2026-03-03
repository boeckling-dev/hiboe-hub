'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { updateFamilyPreferences } from '@/lib/actions/family-preferences'
import { Plus, Trash2, Save } from 'lucide-react'
import type { FamilyPreferences } from '@/lib/db/schema'

interface PreferencesFormProps {
  preferences: FamilyPreferences
}

type FamilyMember = {
  name: string
  role: 'erwachsener' | 'kind'
  ageYears?: number
  allergies: string[]
  dislikes: string[]
  favorites: string[]
}

type DeliveryService = {
  name: string
  url?: string
}

export function PreferencesForm({ preferences }: PreferencesFormProps) {
  const [members, setMembers] = useState<FamilyMember[]>(
    (preferences.familyMembers as FamilyMember[]) ?? []
  )
  const [restrictions, setRestrictions] = useState<string>(
    ((preferences.dietaryRestrictions as string[]) ?? []).join('\n')
  )
  const [equipment, setEquipment] = useState<string>(
    ((preferences.kitchenEquipment as string[]) ?? []).join(', ')
  )
  const [maxPrepWeekday, setMaxPrepWeekday] = useState(preferences.maxPrepTimeWeekday ?? 30)
  const [maxPrepWeekend, setMaxPrepWeekend] = useState(preferences.maxPrepTimeWeekend ?? 60)
  const [deliveryServices, setDeliveryServices] = useState<DeliveryService[]>(
    (preferences.deliveryServices as DeliveryService[]) ?? []
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function addMember() {
    setMembers(prev => [...prev, {
      name: '',
      role: 'erwachsener',
      allergies: [],
      dislikes: [],
      favorites: [],
    }])
  }

  function removeMember(index: number) {
    setMembers(prev => prev.filter((_, i) => i !== index))
  }

  function updateMember(index: number, updates: Partial<FamilyMember>) {
    setMembers(prev => prev.map((m, i) => i === index ? { ...m, ...updates } : m))
  }

  function addDeliveryService() {
    setDeliveryServices(prev => [...prev, { name: '' }])
  }

  function removeDeliveryService(index: number) {
    setDeliveryServices(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    await updateFamilyPreferences({
      familyMembers: members.filter(m => m.name.trim()),
      dietaryRestrictions: restrictions.split('\n').map(r => r.trim()).filter(Boolean),
      kitchenEquipment: equipment.split(',').map(e => e.trim()).filter(Boolean),
      maxPrepTimeWeekday: maxPrepWeekday,
      maxPrepTimeWeekend: maxPrepWeekend,
      deliveryServices: deliveryServices.filter(d => d.name.trim()),
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Family Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Familienmitglieder</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addMember}>
            <Plus className="mr-1 h-4 w-4" />
            Person
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.length === 0 && (
            <p className="text-sm text-slate-400">
              Noch keine Familienmitglieder angelegt. Die KI kann bessere Vorschläge machen, wenn sie eure Familie kennt.
            </p>
          )}
          {members.map((member, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="text"
                    value={member.name}
                    onChange={e => updateMember(idx, { name: e.target.value })}
                    className="flex h-9 w-full max-w-[200px] rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                    placeholder="Name"
                  />
                  <select
                    value={member.role}
                    onChange={e => updateMember(idx, { role: e.target.value as 'erwachsener' | 'kind' })}
                    className="flex h-9 rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="erwachsener">Erwachsener</option>
                    <option value="kind">Kind</option>
                  </select>
                  {member.role === 'kind' && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={18}
                        value={member.ageYears ?? ''}
                        onChange={e => updateMember(idx, { ageYears: Number(e.target.value) || undefined })}
                        className="flex h-9 w-16 rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                        placeholder="Alter"
                      />
                      <span className="text-xs text-slate-500">Jahre</span>
                    </div>
                  )}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeMember(idx)}>
                  <Trash2 className="h-4 w-4 text-slate-400" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Allergien (kommagetrennt)</label>
                  <input
                    type="text"
                    value={member.allergies.join(', ')}
                    onChange={e => updateMember(idx, { allergies: e.target.value.split(',').map(a => a.trim()).filter(Boolean) })}
                    className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                    placeholder="z.B. Nüsse, Laktose"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Mag nicht</label>
                  <input
                    type="text"
                    value={member.dislikes.join(', ')}
                    onChange={e => updateMember(idx, { dislikes: e.target.value.split(',').map(d => d.trim()).filter(Boolean) })}
                    className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                    placeholder="z.B. Pilze, Oliven"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Lieblingsessen</label>
                  <input
                    type="text"
                    value={member.favorites.join(', ')}
                    onChange={e => updateMember(idx, { favorites: e.target.value.split(',').map(f => f.trim()).filter(Boolean) })}
                    className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                    placeholder="z.B. Nudeln, Pizza"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle>Ernährungsregeln</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm text-slate-500">
            Eine Regel pro Zeile, z.B. &quot;Montag vegetarisch&quot; oder &quot;Wenig Zucker für Kinder&quot;
          </p>
          <textarea
            value={restrictions}
            onChange={e => setRestrictions(e.target.value)}
            rows={4}
            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
            placeholder="Montag vegetarisch&#10;Freitag Fisch&#10;Wenig Zucker für Kinder"
          />
        </CardContent>
      </Card>

      {/* Kitchen Equipment & Prep Time */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Küchenausstattung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-sm text-slate-500">
              Kommagetrennt, z.B. Thermomix, Dampfgarer
            </p>
            <input
              type="text"
              value={equipment}
              onChange={e => setEquipment(e.target.value)}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
              placeholder="Thermomix, Backofen, Dampfgarer"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maximale Zubereitungszeit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-600">Unter der Woche: {maxPrepWeekday} Min</label>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={maxPrepWeekday}
                onChange={e => setMaxPrepWeekday(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Am Wochenende: {maxPrepWeekend} Min</label>
              <input
                type="range"
                min={10}
                max={180}
                step={5}
                value={maxPrepWeekend}
                onChange={e => setMaxPrepWeekend(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Services */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lieferdienste</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addDeliveryService}>
            <Plus className="mr-1 h-4 w-4" />
            Dienst
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {deliveryServices.length === 0 && (
            <p className="text-sm text-slate-400">
              Noch keine Lieferdienste hinterlegt. Für den &quot;Zu müde?&quot; Button.
            </p>
          )}
          {deliveryServices.map((service, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={service.name}
                onChange={e => {
                  const updated = [...deliveryServices]
                  updated[idx] = { ...updated[idx], name: e.target.value }
                  setDeliveryServices(updated)
                }}
                className="flex h-9 w-full max-w-[200px] rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                placeholder="Name (z.B. Lieferando)"
              />
              <input
                type="url"
                value={service.url ?? ''}
                onChange={e => {
                  const updated = [...deliveryServices]
                  updated[idx] = { ...updated[idx], url: e.target.value || undefined }
                  setDeliveryServices(updated)
                }}
                className="flex h-9 flex-1 rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                placeholder="URL (optional)"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeDeliveryService(idx)}>
                <Trash2 className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Speichern...' : 'Einstellungen speichern'}
        </Button>
        {saved && (
          <span className="text-sm text-emerald-600">Gespeichert!</span>
        )}
      </div>
    </div>
  )
}
