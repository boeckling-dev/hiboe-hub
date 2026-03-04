'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { upsertMealPlanEntry } from '@/lib/actions/meal-plan-entries'
import { Truck, ExternalLink, X, Pizza } from 'lucide-react'

interface DeliveryOrderDialogProps {
  entryId?: number
  mealPlanId: number
  day: string
  mealType: string
  category: string
  deliveryServices?: { name: string; url?: string }[]
  onClose: () => void
  onConfirm: () => void
}

export function DeliveryOrderDialog({
  entryId,
  mealPlanId,
  day,
  mealType,
  category,
  deliveryServices = [],
  onClose,
  onConfirm,
}: DeliveryOrderDialogProps) {
  const [selectedService, setSelectedService] = useState('')
  const [customService, setCustomService] = useState('')
  const [saving, setSaving] = useState(false)

  const quickOptions = [
    { name: 'Pizza', icon: Pizza },
    { name: 'Sushi', icon: Truck },
    { name: 'Burger', icon: Truck },
  ]

  async function handleConfirm() {
    const serviceName = selectedService || customService
    if (!serviceName.trim()) return

    setSaving(true)

    await upsertMealPlanEntry({
      id: entryId,
      mealPlanId,
      day,
      mealType,
      category,
      mealSource: 'lieferservice',
      deliveryServiceName: serviceName.trim(),
      recipeId: null,
      customMealNote: null,
      vorratNote: null,
    })

    setSaving(false)
    onConfirm()
  }

  return (
    <Card className="border-orange-200">
      <CardHeader className="relative pb-3">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground/60 hover:text-foreground/70"
        >
          <X className="h-4 w-4" />
        </button>
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className="h-5 w-5 text-orange-500" />
          Lieferservice bestellen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick options */}
        <div className="flex flex-wrap gap-2">
          {quickOptions.map(opt => (
            <Button
              key={opt.name}
              type="button"
              variant={selectedService === opt.name ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedService(opt.name)
                setCustomService('')
              }}
            >
              {opt.name}
            </Button>
          ))}
        </div>

        {/* Saved delivery services */}
        {deliveryServices.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Deine Lieferdienste</p>
            {deliveryServices.map(service => (
              <button
                key={service.name}
                type="button"
                onClick={() => {
                  setSelectedService(service.name)
                  setCustomService('')
                }}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                  selectedService === service.name
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-border hover:border-orange-300'
                }`}
              >
                <span>{service.name}</span>
                {service.url && (
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Custom service name */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Oder eigenen eingeben</label>
          <input
            type="text"
            value={customService}
            onChange={e => {
              setCustomService(e.target.value)
              setSelectedService('')
            }}
            className="mt-1 flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meals-highlight/30"
            placeholder="z.B. Lieferando"
          />
        </div>

        <Button
          onClick={handleConfirm}
          disabled={saving || (!selectedService && !customService.trim())}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {saving ? 'Wird gespeichert...' : 'Bestellen'}
        </Button>
      </CardContent>
    </Card>
  )
}
