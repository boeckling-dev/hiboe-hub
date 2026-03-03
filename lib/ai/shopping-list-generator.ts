import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

// ─── Tool Schema ─────────────────────────────────────────────────────────────

const categorizeShoppingListTool: Anthropic.Tool = {
  name: 'categorize_shopping_list',
  description: 'Kategorisiert und konsolidiert eine Einkaufsliste nach Supermarkt-Abteilungen.',
  input_schema: {
    type: 'object' as const,
    properties: {
      items: {
        type: 'array',
        description: 'Kategorisierte und zusammengeführte Einkaufsliste.',
        items: {
          type: 'object',
          properties: {
            ingredient: {
              type: 'string',
              description: 'Name der Zutat (auf Deutsch, normalisiert).',
            },
            quantity: {
              type: 'string',
              description: 'Zusammengeführte Menge.',
            },
            unit: {
              type: 'string',
              description: 'Einheit (g, kg, ml, l, Stück, Bund, EL, TL, Packung, etc.).',
            },
            category: {
              type: 'string',
              enum: [
                'Obst & Gemüse',
                'Kühlregal',
                'Tiefkühl',
                'Brot & Backwaren',
                'Konserven & Trockenwaren',
                'Gewürze & Öle',
                'Getränke',
                'Sonstiges',
              ],
              description: 'Supermarkt-Abteilung für diese Zutat.',
            },
          },
          required: ['ingredient', 'quantity', 'unit', 'category'],
        },
      },
    },
    required: ['items'],
  },
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Uses Claude to intelligently merge duplicate ingredients, normalize names,
 * convert units, and categorize items by supermarket section.
 */
export async function categorizeShoppingList(
  items: Array<{ ingredient: string; quantity: string | null; unit: string | null }>
): Promise<Array<{ ingredient: string; quantity: string; unit: string; category: string }>> {
  if (items.length === 0) return []

  const itemList = items
    .map((item, i) => {
      const qty = item.quantity ?? '?'
      const unit = item.unit ?? ''
      return `${i + 1}. ${item.ingredient} – ${qty} ${unit}`.trim()
    })
    .join('\n')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-3-5-20241022',
    max_tokens: 4096,
    system: `Du bist ein Einkaufslistenassistent. Deine Aufgabe:
1. Führe doppelte Zutaten zusammen (z.B. "Zwiebeln 2 Stück" + "Zwiebel 1 Stück" = "Zwiebeln 3 Stück").
2. Normalisiere die Namen auf Deutsch (z.B. "Tomaten" statt "Tomate", "Kartoffeln" statt "Kartoffel").
3. Konvertiere Einheiten wenn sinnvoll (z.B. 1000g → 1kg, 1000ml → 1l).
4. Ordne jede Zutat der passenden Supermarkt-Abteilung zu:
   - Obst & Gemüse: Frisches Obst, Gemüse, Kräuter, Salate
   - Kühlregal: Milchprodukte, Käse, Joghurt, Sahne, Butter, Eier, Tofu, frische Pasta, Aufschnitt
   - Tiefkühl: Tiefkühlgemüse, Tiefkühlpizza, Eis, TK-Fisch
   - Brot & Backwaren: Brot, Brötchen, Mehl, Backzutaten, Hefe
   - Konserven & Trockenwaren: Nudeln, Reis, Linsen, Bohnen, Dosentomaten, Müsli, Zucker
   - Gewürze & Öle: Gewürze, Olivenöl, Essig, Senf, Sojasoße, Salz, Pfeffer
   - Getränke: Wasser, Saft, Milch (H-Milch), Limonade
   - Sonstiges: Alles was nicht in die anderen Kategorien passt

Alle Ausgaben auf Deutsch.`,
    tools: [categorizeShoppingListTool],
    tool_choice: { type: 'tool', name: 'categorize_shopping_list' },
    messages: [
      {
        role: 'user',
        content: `Bitte kategorisiere und konsolidiere folgende Einkaufsliste:\n\n${itemList}`,
      },
    ],
  })

  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  )

  if (!toolUseBlock) {
    throw new Error('KI hat keine kategorisierte Einkaufsliste zurückgegeben.')
  }

  const result = toolUseBlock.input as {
    items: Array<{ ingredient: string; quantity: string; unit: string; category: string }>
  }

  return result.items
}
