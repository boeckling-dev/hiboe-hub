import { auth } from '@clerk/nextjs/server'
import { getFamilyPreferences } from '@/lib/actions/family-preferences'
import { CookidooImport } from '@/components/meals/cookidoo-import'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function CookidooPage() {
  await auth.protect()
  const preferences = await getFamilyPreferences()

  const isConfigured = Boolean(preferences.cookidooEmail && preferences.cookidooPasswordEncrypted)

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div>
        <Link
          href="/meals/rezepte"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Zur&uuml;ck zu Rezepte
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Cookidoo Import</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rezepte aus deinem Cookidoo-Konto in die Hiboe-Rezeptdatenbank importieren
        </p>
      </div>

      {isConfigured ? (
        <CookidooImport />
      ) : (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-center">
          <p className="text-sm text-amber-800 mb-3">
            Cookidoo ist noch nicht verbunden. Bitte zuerst in den Einstellungen konfigurieren.
          </p>
          <Link
            href="/meals/einstellungen"
            className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-white hover:bg-foreground/90 transition-colors"
          >
            Zu den Einstellungen
          </Link>
        </div>
      )}
    </div>
  )
}
