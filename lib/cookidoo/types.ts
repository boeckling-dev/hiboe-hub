// ─── Cookidoo API Types ─────────────────────────────────────────────────────

/** Credentials for authenticating with Cookidoo. */
export interface CookidooCredentials {
  email: string
  password: string
}

/** A recipe as returned by Cookidoo search/listing. */
export interface CookidooRecipe {
  id: string
  name: string
  imageUrl?: string
  totalTime?: number // seconds
  prepTime?: number // seconds
  servings?: number
}

/** Full recipe details including ingredients and instructions. */
export interface CookidooRecipeDetail extends CookidooRecipe {
  description?: string
  ingredients: CookidooIngredient[]
  instructions: CookidooStep[]
  tools: string[] // e.g. ["TM6"]
  hints?: string
}

/** A Cookidoo ingredient entry. */
export interface CookidooIngredient {
  type: 'INGREDIENT' | 'HEADER'
  text: string
}

/** A Cookidoo instruction step. */
export interface CookidooStep {
  type: 'STEP'
  text: string
}

/** Metadata for a Cookidoo recipe (tools, times, yield). */
export interface CookidooMeta {
  tools: string[]
  totalTime: number // seconds
  prepTime: number // seconds
  yield: {
    value: number
    unitText: string // e.g. "portion"
  }
}

/** A Cookidoo recipe collection (folder/favorites). */
export interface CookidooCollection {
  id: string
  name: string
  recipeCount: number
}

/** Result of a Cookidoo connection test. */
export interface CookidooConnectionResult {
  connected: boolean
  recipeCount?: number
  error?: string
}
