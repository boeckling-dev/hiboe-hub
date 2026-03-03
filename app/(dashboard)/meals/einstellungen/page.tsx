import { auth } from '@clerk/nextjs/server'
import { getFamilyPreferences } from '@/lib/actions/family-preferences'
import { PreferencesForm } from '@/components/meals/preferences-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EinstellungenPage() {
  await auth.protect()
  const preferences = await getFamilyPreferences()

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div>
        <Link
          href="/meals"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zu Mahlzeiten
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Einstellungen</h1>
        <p className="mt-1 text-sm text-slate-500">
          Familieneinstellungen und Ernährungspräferenzen
        </p>
      </div>

      <PreferencesForm preferences={preferences} />
    </div>
  )
}
