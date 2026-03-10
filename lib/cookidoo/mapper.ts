import type { NewRecipe, Recipe } from '@/lib/db/schema'
import type {
  CookidooRecipeDetail,
  CookidooIngredient,
  CookidooStep,
  CookidooMeta,
} from './types'

// ─── Cookidoo → Hiboe (Import) ─────────────────────────────────────────────

/**
 * Convert a Cookidoo recipe to the Hiboe DB format.
 * Used when importing recipes from Cookidoo into the local database.
 */
export function cookidooToRecipe(
  detail: CookidooRecipeDetail,
  cookidooId: string,
): Omit<NewRecipe, 'createdBy'> {
  return {
    title: detail.name,
    description: detail.description ?? null,
    prepTime: detail.prepTime ? Math.round(detail.prepTime / 60) : null,
    cookTime: detail.totalTime && detail.prepTime
      ? Math.round((detail.totalTime - detail.prepTime) / 60)
      : null,
    servings: detail.servings ?? 4,
    difficulty: estimateDifficulty(detail),
    tags: buildTags(detail),
    ingredients: parseIngredients(detail.ingredients),
    instructions: parseInstructions(detail.instructions),
    imageUrl: detail.imageUrl ?? null,
    sourceUrl: `https://cookidoo.de/recipes/recipe/de-DE/${cookidooId}`,
    cookidooId,
    recipeSource: 'cookidoo',
    thermomixModel: extractThermomixModel(detail.tools),
  }
}

// ─── Hiboe → Cookidoo (Export) ──────────────────────────────────────────────

/**
 * Convert a Hiboe recipe to Cookidoo format for uploading.
 * Used when exporting AI-generated or manual recipes to Cookidoo.
 */
export function recipeToCookidoo(recipe: Recipe): {
  name: string
  ingredients: CookidooIngredient[]
  instructions: CookidooStep[]
  meta: CookidooMeta
} {
  return {
    name: recipe.title,
    ingredients: (recipe.ingredients ?? []).map((ing) => ({
      type: 'INGREDIENT' as const,
      text: formatIngredientText(ing),
    })),
    instructions: (recipe.instructions ?? []).map((inst) => ({
      type: 'STEP' as const,
      text: inst.text,
    })),
    meta: {
      tools: [recipe.thermomixModel ?? 'TM6'],
      totalTime: ((recipe.prepTime ?? 0) + (recipe.cookTime ?? 0)) * 60, // minutes → seconds
      prepTime: (recipe.prepTime ?? 0) * 60,
      yield: {
        value: recipe.servings ?? 4,
        unitText: 'portion',
      },
    },
  }
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

/**
 * Parse Cookidoo ingredient entries into Hiboe format.
 * Cookidoo ingredients are plain text strings like "200 g Mehl".
 */
function parseIngredients(
  ingredients: CookidooIngredient[],
): { name: string; quantity: string; unit: string }[] {
  return ingredients
    .filter((i) => i.type === 'INGREDIENT')
    .map((i) => parseIngredientText(i.text))
}

/**
 * Parse a single ingredient text string into structured format.
 * Examples: "200 g Mehl", "1 EL Olivenöl", "3 Eier", "Salz und Pfeffer"
 */
function parseIngredientText(text: string): { name: string; quantity: string; unit: string } {
  const match = text.match(
    /^([\d.,/½¼¾⅓⅔]+)?\s*(g|kg|ml|l|EL|TL|Stück|Stk|Prise|Priese|Bund|Dose|Becher|Scheibe|Scheiben|Zehe|Zehen|Packung|Päckchen|Pck|cm|mm)?\s*(.+)$/i,
  )

  if (match) {
    return {
      quantity: (match[1] ?? '').trim(),
      unit: (match[2] ?? '').trim(),
      name: (match[3] ?? text).trim(),
    }
  }

  return { quantity: '', unit: '', name: text.trim() }
}

/**
 * Format a structured ingredient back to text for Cookidoo upload.
 */
function formatIngredientText(ing: { name: string; quantity: string; unit: string }): string {
  const parts = [ing.quantity, ing.unit, ing.name].filter(Boolean)
  return parts.join(' ')
}

/**
 * Parse Cookidoo instruction steps into Hiboe format.
 */
function parseInstructions(
  steps: CookidooStep[],
): { step: number; text: string }[] {
  return steps.map((s, idx) => ({
    step: idx + 1,
    text: s.text,
  }))
}

/**
 * Estimate difficulty based on number of ingredients and steps.
 */
function estimateDifficulty(detail: CookidooRecipeDetail): string {
  const ingredientCount = detail.ingredients.filter(i => i.type === 'INGREDIENT').length
  const stepCount = detail.instructions.length
  const totalMinutes = detail.totalTime ? detail.totalTime / 60 : 0

  if (ingredientCount <= 6 && stepCount <= 4 && totalMinutes <= 30) return 'einfach'
  if (ingredientCount >= 15 || stepCount >= 10 || totalMinutes >= 90) return 'schwer'
  return 'mittel'
}

/**
 * Build tags from Cookidoo recipe metadata.
 */
function buildTags(detail: CookidooRecipeDetail): string[] {
  const tags: string[] = ['Thermomix']

  const model = extractThermomixModel(detail.tools)
  if (model) tags.push(model)

  const totalMinutes = detail.totalTime ? detail.totalTime / 60 : 0
  if (totalMinutes > 0 && totalMinutes <= 30) tags.push('schnell')

  return tags
}

/**
 * Extract the Thermomix model from tools array.
 */
function extractThermomixModel(tools: string[]): string | null {
  for (const tool of tools) {
    if (/TM\d/i.test(tool)) return tool.toUpperCase()
  }
  return null
}
