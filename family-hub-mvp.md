# Family Hub – MVP Scope & Architektur

## 1. Projektziel

Eine Web-App für eine vierköpfige Familie (zwei Erwachsene, zwei Kleinkinder unter 3), die den Familienalltag organisiert. Start als responsive Web-App mit späterer Option auf Native Mobile.

**Zwei aktive Nutzer:** Beide Elternteile.

---

## 2. MVP-Module

### Modul 1: Meal Planning (höchster Alltagsschmerz)

**Problem:** Täglicher Stress bei der Frage "Was essen wir heute?" – bisherige Lösungen (Vorkochen am Wochenende, automatisierte Rezeptmails) werden nicht durchgehalten.

**Lösung:**

- **Wochenplan-Ansicht** (Mo–So) mit je Mittag- und Abendessen
- **Zwei Kategorien:** Familienessen (alle zusammen) und Kinderessen (kindgerechte Gerichte)
- **Rezeptdatenbank** mit Tags: schnell (<30 Min), kindgerecht, vorbereitbar, vegetarisch etc.
- **KI-gestützte Vorschläge:** Wöchentlicher Plan wird automatisch generiert basierend auf Präferenzen, Saison, und was zuletzt gekocht wurde (Abwechslung) --> wichtig rezpte sollen auf echten Rezepten aus dem internet basieren. Nicht von der KI ausgedacht und für den thermomix gemacht sein
- **One-Click Einkaufsliste:** Aus dem Wochenplan wird automatisch eine konsolidierte Einkaufsliste generiert
- **Bring!-Integration:** Einkaufsliste direkt an Bring! senden (via Bring! API oder Make-Webhook)
- **Anpassbar:** Gerichte per Drag & Drop tauschen, einzelne Tage manuell überschreiben

**User Flow:**
1. Sonntag: App zeigt generierten Wochenplan → Nutzer passt an → bestätigt
2. Einkaufsliste wird generiert → mit einem Tap an Bring! gesendet
3. Unter der Woche: Tagesansicht zeigt heutiges Rezept mit Zutaten und kurzer Anleitung

---

### Modul 2: Haushaltsinventar mit Chat-Interface (schneller Alltagswin)

**Problem:** Dinge werden in der Wohnung und im Keller nicht gefunden. Wo liegt was?

**Lösung:**

- **Chat-Interface:** Natürliche Spracheingabe – "Wo ist der Schlafsack?" → "Kellerregal links, blaue Box"
- **Inventar-Datenbank** mit Feldern: Gegenstand, Kategorie, Ort (Raum + konkreter Platz), Notizen, Foto (optional)
- **Einfache Erfassung:** Items per Chat hinzufügen – "Der Schlafsack ist im Keller, linkes Regal, blaue Box"
- **KI-gestützte Suche:** Fuzzy-Matching, Synonyme ("Campingsack" findet "Schlafsack"), Kategoriesuche ("Alle Wintersachen")
- **Bulk-Import:** Möglichkeit, mehrere Items auf einmal per Liste einzutragen

**User Flow:**
1. Erfassung: "Winterjacke Mia Größe 86 liegt im Keller, Regal 2, grüne Kiste" → wird geparst und gespeichert
2. Suche: "Wo sind Mias Winterklamotten?" → zeigt alle relevanten Items mit Orten

---

### Modul 3: Immobilien-Entscheidungstool (größter strategischer Schmerz)

**Problem:** Immobilienkauf ist ein wiederkehrendes Thema, aber Entscheidungsgrundlagen fehlen. Exposés werden ad hoc bewertet statt systematisch.

**Lösung:**

- **Kriterienprofil:** Einmalig definieren – Budget, Lage-Präferenzen, Mindestgröße, Must-Haves, Deal-Breakers
- **Exposé-Upload:** PDF oder Link hochladen → KI extrahiert Kerndaten (Preis, Größe, Lage, Zustand, Nebenkosten, Energieausweis etc.)
- **Automatisierte Bewertung:** Score-Card gegen das Kriterienprofil, Ampelsystem (grün/gelb/rot)
- **Offene-Fragen-Liste:** Was muss noch geklärt werden? (z.B. Renovierungskosten, Grundbuch, Nachbarschaft)
- **Finanzierungsrechner:** Grobe Kalkulation mit Eigenkapital, Zins, Tilgung, Nebenkosten
- **Vergleichsansicht:** Mehrere Objekte nebeneinander vergleichen

**User Flow:**
1. Kriterienprofil einmal anlegen
2. Exposé hochladen → Daten werden extrahiert → Bewertung wird erstellt
3. Dashboard zeigt alle bewerteten Objekte im Vergleich

---

## 3. Technische Architektur

### Stack

| Schicht | Technologie | Begründung |
|---------|-------------|------------|
| **Frontend** | Next.js (App Router) + React | Erfahrung vorhanden, SSR für Performance, gute Mobile-Basis |
| **Styling** | Tailwind CSS + shadcn/ui | Schnelle Entwicklung, konsistentes Design-System |
| **Backend/API** | Next.js API Routes + Server Actions | Kein separater Backend-Server nötig |
| **Datenbank** | Neon PostgreSQL (Serverless) | Serverless-kompatibel mit Vercel, SQL-basiert |
| **ORM** | Drizzle ORM | Erfahrung vorhanden, Type-safe, leichtgewichtig |
| **Auth** | Clerk | Erfahrung vorhanden, einfaches Setup für 2 Nutzer |
| **KI/LLM** | Claude API (Anthropic) | Rezeptgenerierung, Inventar-Chat, Exposé-Analyse |
| **File Storage** | Vercel Blob oder Cloudflare R2 | Für Exposé-PDFs und optionale Inventar-Fotos |
| **Hosting** | Vercel | Erfahrung vorhanden, Next.js-optimiert |
| **Automation** | Make (Integromat) | Bring!-Integration, ggf. Kalender-Sync |

### Datenbank-Schema (Überblick)

```
── users (via Clerk)

── recipes
   ├── id, title, description
   ├── prep_time, cook_time
   ├── servings, difficulty
   ├── tags[] (schnell, kindgerecht, vegetarisch...)
   ├── ingredients[] (jsonb)
   ├── instructions[] (jsonb)
   └── image_url

── meal_plans
   ├── id, week_start_date
   ├── created_by (user_id)
   └── status (draft, active, archived)

── meal_plan_entries
   ├── id, meal_plan_id
   ├── day (mo-so), meal_type (lunch, dinner)
   ├── category (family, kids)
   └── recipe_id

── shopping_list_items
   ├── id, meal_plan_id
   ├── ingredient, quantity, unit
   ├── category (Supermarkt, Drogerie...)
   └── checked (boolean)

── inventory_items
   ├── id, name, category
   ├── location_room, location_detail
   ├── notes, photo_url
   └── created_by, updated_at

── property_criteria
   ├── id, budget_max, min_size
   ├── preferred_locations[] (jsonb)
   ├── must_haves[] (jsonb)
   ├── deal_breakers[] (jsonb)
   └── financing (jsonb: eigenkapital, max_rate...)

── properties
   ├── id, title, source_url, exposé_url
   ├── extracted_data (jsonb: preis, größe, lage...)
   ├── score, score_details (jsonb)
   ├── open_questions[] (jsonb)
   ├── status (neu, in_prüfung, abgelehnt, favorit)
   └── notes, created_at
```

### KI-Integration

| Modul | KI-Einsatz | Modell |
|-------|-----------|--------|
| Meal Planning | Wochenplan generieren, Rezepte vorschlagen | Claude Sonnet (schnell, günstig) |
| Inventar | Chat-Interface, natürliche Sprache parsen | Claude Sonnet |
| Immobilien | PDF-Extraktion, Bewertung, Fragen generieren | Claude Sonnet (ggf. Opus für komplexe Analysen) |

### Externe Integrationen

| Integration | Methode | Zweck |
|-------------|---------|-------|
| **Bring!** | Make Webhook → Bring! API | Einkaufsliste senden |
| **Apple Kalender** | Bestehend, kein Ersatz | Kalender bleibt extern |

### Projektstruktur (Next.js App Router)

```
family-hub/
├── app/
│   ├── layout.tsx              # Root Layout + Clerk Provider
│   ├── page.tsx                # Dashboard/Home
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── meals/
│   │   ├── page.tsx            # Wochenplan-Ansicht
│   │   ├── [planId]/
│   │   ├── recipes/
│   │   └── shopping-list/
│   ├── inventory/
│   │   └── page.tsx            # Chat + Inventarliste
│   └── properties/
│       ├── page.tsx            # Dashboard/Vergleich
│       ├── criteria/
│       ├── [propertyId]/
│       └── upload/
├── components/
│   ├── ui/                     # shadcn/ui Komponenten
│   ├── meals/
│   ├── inventory/
│   └── properties/
├── lib/
│   ├── db/
│   │   ├── schema.ts           # Drizzle Schema
│   │   └── queries/
│   ├── ai/
│   │   ├── meal-planner.ts
│   │   ├── inventory-chat.ts
│   │   └── property-analyzer.ts
│   └── integrations/
│       └── bring.ts
├── drizzle/
│   └── migrations/
└── public/
```

---

## 4. Entwicklungsreihenfolge

### Phase 1: Foundation (Woche 1)
- [ ] Next.js Projekt aufsetzen mit App Router
- [ ] Clerk Auth integrieren
- [ ] Neon DB + Drizzle ORM Setup
- [ ] Basis-Layout mit Navigation (Dashboard, Meals, Inventar, Immobilien)
- [ ] shadcn/ui Komponenten installieren

### Phase 2: Meal Planning (Woche 2–3)
- [ ] Rezept-Datenbank mit CRUD
- [ ] Initiale Rezepte einspeisen (20–30 Familienrezepte)
- [ ] Wochenplan-UI mit Tagesansicht
- [ ] Claude API Integration für Planvorschläge
- [ ] Einkaufslisten-Generierung
- [ ] Bring!-Integration via Make

### Phase 3: Inventar (Woche 4)
- [ ] Inventar-Datenbank mit CRUD
- [ ] Chat-Interface mit Claude für Suche und Erfassung
- [ ] Bulk-Import Funktion
- [ ] Kategorie- und Raumfilter

### Phase 4: Immobilien (Woche 5–6)
- [ ] Kriterienprofil Setup-Wizard
- [ ] PDF-Upload + Claude-basierte Datenextraktion
- [ ] Bewertungs-Scorecard mit Ampelsystem
- [ ] Vergleichsansicht
- [ ] Einfacher Finanzierungsrechner

### Phase 5: Polish & Integration (Woche 7)
- [ ] Dashboard mit Übersicht aller Module
- [ ] Mobile-Optimierung (responsive)
- [ ] Performance-Optimierung
- [ ] Error Handling & Edge Cases

---

## 5. Offene Entscheidungen

| Frage | Optionen | Empfehlung |
|-------|----------|------------|
| Rezeptquelle | Eigene DB vs. API (Spoonacular etc.) | Start mit eigener DB, später API anbinden |
| Bring!-Integration | Direkte API vs. Make Webhook | Make (flexibler, keine API-Key-Verwaltung) |
| File Storage für Exposés | Vercel Blob vs. R2 | Vercel Blob (einfacher im Vercel-Ökosystem) |
| Inventar-Fotos | Ja/Nein im MVP | Optional – nice-to-have, kein Muss |
| PWA | Ja/Nein | Ja – einfach mit Next.js, fühlt sich "appig" an |

---

## 6. Nicht im MVP-Scope

Diese Features werden bewusst zurückgestellt:

- Finanztracking (Ausgabenübersicht) → Phase 2
- Steueroptimierung → Phase 2
- Geschenke-Tracker → Phase 2
- Langfristige Finanzplanung (Sparen/Anlegen) → Phase 2
- Kalender-Integration (Apple Kalender bleibt standalone)
- Native Mobile App → nach MVP-Validierung
- Multi-Haushalt / weitere Familienmitglieder → nicht geplant
