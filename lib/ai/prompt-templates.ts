import type { FamilyPreferences, Recipe, MealRating } from '@/lib/db/schema'
import type { WeekContext } from '@/lib/types/meals'

/**
 * System prompt for the AI meal planner.
 * All instructions are in German to ensure German-language output.
 */
export function buildMealPlanSystemPrompt(): string {
  return `Du bist ein erfahrener Familien-Ernährungsberater und Meal-Planner für eine deutsche Familie mit Kleinkindern.

## Deine Aufgabe
Erstelle ausgewogene, familientaugliche Wochenpläne mit konkreten Rezepten.

## Wichtige Regeln

### Rezeptquellen
- Alle Rezepte MÜSSEN auf ECHTEN, bekannten Gerichten basieren – keine erfundenen Fantasie-Rezepte.
- Setze sourceUrl IMMER auf null. Die URL wird automatisch per Internetsuche ermittelt.
- Gib stattdessen einen guten searchQuery an – einen Suchbegriff, mit dem man das Rezept im Internet finden kann (z.B. "Kartoffelsuppe vegetarisch einfach", "Hähnchen Brokkoli Auflauf Familienrezept").
- Der searchQuery soll den Rezepttitel und 1–2 relevante Stichworte enthalten.

### Kleinkind-Sicherheit
- KEINE ganzen Nüsse, Mandeln oder harten Kerne (Erstickungsgefahr).
- KEINE rohen Eier oder rohes Fleisch/Fisch.
- KEIN Honig für Kinder unter 1 Jahr.
- WENIG Salz – Kinderportionen müssen salzarm sein.
- KEINE scharfen Gewürze (Chili, scharfer Paprika, etc.).
- Weiche Texturen bevorzugen – alles muss für Kleinkinder gut kaubar sein.
- Bei Gerichten der Kategorie "alle": Das Rezept muss für Kleinkinder geeignet sein.

### Abwechslung
- Verschiedene Proteinquellen über die Woche verteilen (Fleisch, Fisch, Hülsenfrüchte, Eier, Milchprodukte, Tofu).
- NIEMALS das gleiche Gericht in einer Woche wiederholen.
- Verschiedene Küchenstile einbauen (deutsch, italienisch, asiatisch mild, etc.).
- Verschiedene Zubereitungsarten (Ofen, Pfanne, Eintopf, Rohkost, etc.).

### Praktikabilität
- Unter der Woche (Mo–Fr): Maximal 30 Minuten Zubereitungszeit, einfache Rezepte bevorzugen.
- Am Wochenende (Sa–So): Mehr Zeit erlaubt, auch aufwändigere Rezepte möglich.
- Berücksichtige die verfügbare Küchenausstattung der Familie.

### Saisonalität
- Bevorzuge saisonale Zutaten für den aktuellen Monat.
- Nutze regionales Gemüse und Obst der Saison.

### Reste-Verwertung
- Wenn am Tag X ein großes Gericht gekocht wird, plane am Tag X+1 eine Restevariation ein.
- Beispiel: Großer Braten am Sonntag → Aufschnitt/Sandwiches am Montag.
- Kennzeichne Reste-Variationen im reasoning-Feld.

### Kategorien
- "alle": Gerichte, die für die ganze Familie geeignet sind (inkl. Kleinkinder).
- "erwachsene": Gerichte nur für Erwachsene (dürfen schärfer/komplexer sein).
- "kinder": Spezielle Kinderportionen oder kindgerechte Alternativen.

### Ausgabesprache
- Alle Texte (Titel, Beschreibungen, Zutaten, Anleitungen, Zusammenfassungen) MÜSSEN auf Deutsch sein.
- Zutatenmengen in metrischen Einheiten (g, kg, ml, l, EL, TL, Stück, Bund, etc.).`
}

/**
 * Build the user prompt for weekly meal plan generation.
 */
export function buildWeeklyPlanUserPrompt(context: {
  familyPreferences: FamilyPreferences
  recentMealHistory: Recipe[]
  recentRatings: MealRating[]
  weekContext?: WeekContext
  currentSeason: string
  currentMonth: string
}): string {
  const {
    familyPreferences,
    recentMealHistory,
    recentRatings,
    weekContext,
    currentSeason,
    currentMonth,
  } = context

  const members = familyPreferences.familyMembers ?? []
  const restrictions = familyPreferences.dietaryRestrictions ?? []
  const equipment = familyPreferences.kitchenEquipment ?? []
  const maxPrepWeekday = familyPreferences.maxPrepTimeWeekday ?? 30
  const maxPrepWeekend = familyPreferences.maxPrepTimeWeekend ?? 60

  let prompt = `Erstelle einen vollständigen Wochenplan (Montag bis Sonntag) mit Mittag- und Abendessen.

## Aktuelle Jahreszeit & Monat
- Jahreszeit: ${currentSeason}
- Monat: ${currentMonth}
Bitte bevorzuge saisonale Zutaten für ${currentMonth} (${currentSeason}).

## Familienprofil
`

  if (members.length > 0) {
    prompt += `### Familienmitglieder\n`
    for (const member of members) {
      prompt += `- **${member.name}** (${member.role}${member.ageYears ? `, ${member.ageYears} Jahre` : ''})\n`
      if (member.allergies.length > 0) {
        prompt += `  - Allergien: ${member.allergies.join(', ')}\n`
      }
      if (member.dislikes.length > 0) {
        prompt += `  - Mag nicht: ${member.dislikes.join(', ')}\n`
      }
      if (member.favorites.length > 0) {
        prompt += `  - Lieblingsessen: ${member.favorites.join(', ')}\n`
      }
    }
  }

  if (restrictions.length > 0) {
    prompt += `\n### Ernährungseinschränkungen\n${restrictions.join(', ')}\n`
  }

  if (equipment.length > 0) {
    prompt += `\n### Verfügbare Küchengeräte\n${equipment.join(', ')}\n`
  }

  prompt += `\n### Zeitlimits
- Wochentags (Mo–Fr): maximal ${maxPrepWeekday} Minuten Zubereitungszeit
- Wochenende (Sa–So): maximal ${maxPrepWeekend} Minuten Zubereitungszeit\n`

  // Recent meal history to avoid repetition
  if (recentMealHistory.length > 0) {
    prompt += `\n## Kürzlich gekochte Gerichte (NICHT wiederholen!)\n`
    for (const recipe of recentMealHistory) {
      prompt += `- ${recipe.title}\n`
    }
  }

  // Recent ratings to learn preferences
  if (recentRatings.length > 0) {
    const liked = recentRatings.filter(r => r.rating === 2)
    const disliked = recentRatings.filter(r => r.rating === 1)

    if (liked.length > 0) {
      prompt += `\n## Positiv bewertete Gerichte (mehr davon!)\n`
      for (const rating of liked) {
        const kidsNote = rating.kidsLikedIt ? ' (Kinder mochten es!)' : ''
        const note = rating.note ? ` – "${rating.note}"` : ''
        prompt += `- Rezept-ID ${rating.recipeId}${kidsNote}${note}\n`
      }
    }

    if (disliked.length > 0) {
      prompt += `\n## Negativ bewertete Gerichte (vermeiden!)\n`
      for (const rating of disliked) {
        const note = rating.note ? ` – "${rating.note}"` : ''
        prompt += `- Rezept-ID ${rating.recipeId}${note}\n`
      }
    }
  }

  // Week context (special events, eating out days, leftovers)
  if (weekContext) {
    prompt += `\n## Kontext für diese Woche\n`

    if (weekContext.specialEvents && weekContext.specialEvents.length > 0) {
      prompt += `### Besondere Anlässe\n`
      for (const event of weekContext.specialEvents) {
        prompt += `- ${event}\n`
      }
    }

    if (weekContext.eatingOutDays && weekContext.eatingOutDays.length > 0) {
      prompt += `### Auswärts essen (kein Kochen nötig)\n`
      for (const day of weekContext.eatingOutDays) {
        prompt += `- ${day}\n`
      }
      prompt += `Für diese Tage/Mahlzeiten KEINE Rezeptvorschläge machen.\n`
    }

    if (weekContext.leftoversFromLastWeek && weekContext.leftoversFromLastWeek.length > 0) {
      prompt += `### Reste von letzter Woche (bitte einplanen)\n`
      for (const leftover of weekContext.leftoversFromLastWeek) {
        prompt += `- ${leftover}\n`
      }
    }
  }

  prompt += `
## Anforderungen an den Plan
1. Plane für jeden Tag (Mo–So) Mittagessen und Abendessen.
2. Wähle für jede Mahlzeit die passende Kategorie: "alle", "erwachsene" oder "kinder".
3. Die meisten Mahlzeiten sollten Kategorie "alle" sein (familientauglich).
4. Gib eine kurze Wochenzusammenfassung und eine grobe Einkaufsschätzung.
5. Begründe bei jedem Vorschlag kurz, warum dieses Gericht gewählt wurde.
6. Achte auf Abwechslung bei Proteinquellen, Zubereitungsarten und Küchenstilen.`

  return prompt
}

/**
 * Build the prompt for generating a single alternative meal suggestion.
 */
export function buildAlternativeSuggestionPrompt(context: {
  day: string
  mealType: string
  category: string
  currentPlanSummary?: string
  excludeRecipeTitles?: string[]
  familyPreferences: FamilyPreferences
  currentSeason: string
  currentMonth: string
}): string {
  const {
    day,
    mealType,
    category,
    currentPlanSummary,
    excludeRecipeTitles,
    familyPreferences,
    currentSeason,
    currentMonth,
  } = context

  const mealTypeLabel = mealType === 'lunch' ? 'Mittagessen' : 'Abendessen'
  const dayLabels: Record<string, string> = {
    mo: 'Montag', di: 'Dienstag', mi: 'Mittwoch', do: 'Donnerstag',
    fr: 'Freitag', sa: 'Samstag', so: 'Sonntag',
  }
  const dayLabel = dayLabels[day] ?? day
  const isWeekend = day === 'sa' || day === 'so'
  const maxPrep = isWeekend
    ? (familyPreferences.maxPrepTimeWeekend ?? 60)
    : (familyPreferences.maxPrepTimeWeekday ?? 30)

  const members = familyPreferences.familyMembers ?? []
  const restrictions = familyPreferences.dietaryRestrictions ?? []

  let prompt = `Schlage ein alternatives Rezept vor für:
- **Tag**: ${dayLabel}
- **Mahlzeit**: ${mealTypeLabel}
- **Kategorie**: ${category}
- **Jahreszeit**: ${currentSeason} (${currentMonth})
- **Maximale Zubereitungszeit**: ${maxPrep} Minuten`

  if (members.length > 0) {
    const allergies = members.flatMap(m => m.allergies).filter(Boolean)
    const dislikes = members.flatMap(m => m.dislikes).filter(Boolean)
    if (allergies.length > 0) {
      prompt += `\n- **Allergien beachten**: ${[...new Set(allergies)].join(', ')}`
    }
    if (dislikes.length > 0) {
      prompt += `\n- **Abneigungen beachten**: ${[...new Set(dislikes)].join(', ')}`
    }
  }

  if (restrictions.length > 0) {
    prompt += `\n- **Ernährungseinschränkungen**: ${restrictions.join(', ')}`
  }

  if (currentPlanSummary) {
    prompt += `\n\n## Aktueller Wochenplan (zur Abwechslung beachten)\n${currentPlanSummary}`
  }

  if (excludeRecipeTitles && excludeRecipeTitles.length > 0) {
    prompt += `\n\n## Diese Rezepte NICHT vorschlagen\n`
    for (const title of excludeRecipeTitles) {
      prompt += `- ${title}\n`
    }
  }

  prompt += `\n\nSchlage EIN passendes Rezept vor. Begründe kurz, warum es gut passt.`

  return prompt
}
