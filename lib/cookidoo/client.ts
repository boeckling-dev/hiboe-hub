import type {
  CookidooCredentials,
  CookidooRecipe,
  CookidooRecipeDetail,
  CookidooCollection,
  CookidooIngredient,
  CookidooStep,
  CookidooMeta,
} from './types'

// ─── Configuration ──────────────────────────────────────────────────────────

/** Cookidoo uses Vorwerk's mobile API with OAuth2 password grant. */
const API_ENDPOINT = 'https://de.tmmobile.vorwerk-digital.com'
const TOKEN_PATH = 'ciam/auth/token'
const LANGUAGE = 'de-DE'

const COOKIDOO_CLIENT_ID = 'kupferwerk-client-nwot'
const COOKIDOO_CLIENT_SECRET = 'Ls50ON1woySqs1dCdJge'
const COOKIDOO_BASIC_AUTH = `Basic ${btoa(`${COOKIDOO_CLIENT_ID}:${COOKIDOO_CLIENT_SECRET}`)}`

const REQUEST_TIMEOUT_MS = 15_000
const MAX_RETRIES = 2

// ─── Client ─────────────────────────────────────────────────────────────────

/**
 * TypeScript client for the Cookidoo API (Vorwerk Thermomix).
 *
 * Authentication uses OAuth2 password grant via the Vorwerk CIAM token endpoint.
 * Based on: https://github.com/miaucl/cookidoo-api
 */
export class CookidooClient {
  private accessToken: string | null = null

  private get apiHeaders(): Record<string, string> {
    if (!this.accessToken) throw new Error('Nicht bei Cookidoo angemeldet')
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
      'Cookie': `v-token=${this.accessToken}`,
    }
  }

  // ─── Auth ───────────────────────────────────────────────────────────────

  /**
   * Login to Cookidoo with email and password via OAuth2 password grant.
   */
  async login(credentials: CookidooCredentials): Promise<void> {
    const { email, password } = credentials

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const body = new URLSearchParams({
        grant_type: 'password',
        username: email,
        password: password,
      })

      const response = await fetch(`${API_ENDPOINT}/${TOKEN_PATH}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': COOKIDOO_BASIC_AUTH,
        },
        body: body.toString(),
        signal: controller.signal,
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 400) {
          throw new Error('Cookidoo-Login fehlgeschlagen: E-Mail oder Passwort falsch')
        }
        throw new Error(`Cookidoo-Login fehlgeschlagen (Status ${response.status})`)
      }

      const data = await response.json() as {
        access_token?: string
        refresh_token?: string
        token_type?: string
        expires_in?: number
      }

      if (!data.access_token) {
        throw new Error('Cookidoo-Login fehlgeschlagen: Kein Access-Token erhalten')
      }

      this.accessToken = data.access_token
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Set an access token directly (e.g. from stored session).
   */
  setToken(token: string): void {
    this.accessToken = token
  }

  /**
   * Check if the client has a valid token.
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null
  }

  // ─── Read Operations ──────────────────────────────────────────────────

  /**
   * Search for recipes in Cookidoo.
   */
  async searchRecipes(query: string): Promise<CookidooRecipe[]> {
    const params = new URLSearchParams({
      query,
      country: 'de',
      language: LANGUAGE,
    })

    const data = await this.request<{ recipes?: CookidooRecipeListItem[] }>(
      `/search/${LANGUAGE}?${params}`,
      'GET',
    )

    return (data.recipes ?? []).map(mapListItemToRecipe)
  }

  /**
   * Get the user's recipe collections (custom lists).
   */
  async getCollections(): Promise<CookidooCollection[]> {
    const data = await this.request<{ collections?: CookidooCollectionRaw[] }>(
      `/organize/${LANGUAGE}/api/custom-list`,
      'GET',
    )

    return (data.collections ?? []).map((c) => ({
      id: c.id ?? c.collectionId ?? '',
      name: c.name ?? c.title ?? 'Unbenannt',
      recipeCount: c.recipeCount ?? c.totalRecipes ?? 0,
    }))
  }

  /**
   * Get recipes from a specific collection.
   */
  async getCollectionRecipes(collectionId: string): Promise<CookidooRecipe[]> {
    const data = await this.request<{ recipes?: CookidooRecipeListItem[] }>(
      `/organize/${LANGUAGE}/api/custom-list/${collectionId}`,
      'GET',
    )

    return (data.recipes ?? []).map(mapListItemToRecipe)
  }

  /**
   * Get full recipe details by ID.
   */
  async getRecipeDetails(recipeId: string): Promise<CookidooRecipeDetail> {
    const data = await this.request<CookidooRecipeDetailRaw>(
      `/recipes/recipe/${LANGUAGE}/${recipeId}`,
      'GET',
    )

    return {
      id: recipeId,
      name: data.name ?? data.title ?? '',
      description: data.description,
      imageUrl: data.imageUrl ?? data.image?.url,
      totalTime: data.totalTime,
      prepTime: data.prepTime,
      servings: data.yield?.value ?? data.servings,
      ingredients: (data.ingredients ?? []).map((i) => ({
        type: (i.type ?? 'INGREDIENT') as 'INGREDIENT' | 'HEADER',
        text: i.text ?? i.name ?? '',
      })),
      instructions: (data.instructions ?? data.steps ?? []).map((s) => ({
        type: 'STEP' as const,
        text: s.text ?? s.description ?? '',
      })),
      tools: data.tools ?? [],
      hints: data.hints,
    }
  }

  // ─── Write Operations (Custom Recipes) ────────────────────────────────

  /**
   * Create a new custom recipe in Cookidoo.
   * Returns the new recipe ID.
   */
  async createRecipe(name: string): Promise<string> {
    const data = await this.request<{ recipeId: string }>(
      `/created-recipes/${LANGUAGE}`,
      'POST',
      { recipeName: name },
    )

    if (!data.recipeId) {
      throw new Error('Cookidoo hat keine Rezept-ID zurückgegeben')
    }

    return data.recipeId
  }

  /**
   * Update ingredients of a custom recipe.
   */
  async updateIngredients(recipeId: string, ingredients: CookidooIngredient[]): Promise<void> {
    await this.request(
      `/created-recipes/${LANGUAGE}/${recipeId}`,
      'PATCH',
      { ingredients },
    )
  }

  /**
   * Update instructions of a custom recipe.
   */
  async updateInstructions(recipeId: string, instructions: CookidooStep[]): Promise<void> {
    await this.request(
      `/created-recipes/${LANGUAGE}/${recipeId}`,
      'PATCH',
      { instructions },
    )
  }

  /**
   * Update metadata (tools, times, yield) of a custom recipe.
   */
  async updateMetadata(recipeId: string, meta: CookidooMeta): Promise<void> {
    await this.request(
      `/created-recipes/${LANGUAGE}/${recipeId}`,
      'PATCH',
      meta,
    )
  }

  /**
   * Full recipe export: create + populate all fields.
   * Returns the Cookidoo recipe ID.
   */
  async exportFullRecipe(data: {
    name: string
    ingredients: CookidooIngredient[]
    instructions: CookidooStep[]
    meta: CookidooMeta
  }): Promise<string> {
    const recipeId = await this.createRecipe(data.name)

    // Cookidoo requires a short delay between creation and updates
    await sleep(1000)

    // Update all fields in parallel (they target different fields)
    await Promise.all([
      this.updateIngredients(recipeId, data.ingredients),
      this.updateInstructions(recipeId, data.instructions),
      this.updateMetadata(recipeId, data.meta),
    ])

    return recipeId
  }

  // ─── Internal ─────────────────────────────────────────────────────────

  private async request<T = unknown>(
    path: string,
    method: 'GET' | 'POST' | 'PATCH',
    body?: unknown,
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      try {
        const response = await fetch(`${API_ENDPOINT}${path}`, {
          method,
          headers: this.apiHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        })

        if (response.status === 401 || response.status === 403) {
          throw new Error('Cookidoo-Sitzung abgelaufen. Bitte erneut anmelden.')
        }

        if (!response.ok) {
          throw new Error(`Cookidoo API Fehler: ${response.status} ${response.statusText}`)
        }

        return await response.json() as T
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))

        // Don't retry auth errors
        if (lastError.message.includes('abgelaufen')) throw lastError

        // Retry on network/timeout errors
        if (attempt < MAX_RETRIES) {
          await sleep(1000 * (attempt + 1))
          continue
        }
      } finally {
        clearTimeout(timeout)
      }
    }

    throw lastError ?? new Error('Cookidoo API Fehler')
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Raw API response types (flexible to handle API variations) ─────────

interface CookidooRecipeListItem {
  id?: string
  recipeId?: string
  name?: string
  title?: string
  imageUrl?: string
  image?: { url?: string }
  totalTime?: number
  prepTime?: number
  servings?: number
  yield?: { value?: number }
}

interface CookidooCollectionRaw {
  id?: string
  collectionId?: string
  name?: string
  title?: string
  recipeCount?: number
  totalRecipes?: number
}

interface CookidooRecipeDetailRaw {
  name?: string
  title?: string
  description?: string
  imageUrl?: string
  image?: { url?: string }
  totalTime?: number
  prepTime?: number
  servings?: number
  yield?: { value?: number }
  ingredients?: Array<{ type?: string; text?: string; name?: string }>
  instructions?: Array<{ type?: string; text?: string; description?: string }>
  steps?: Array<{ type?: string; text?: string; description?: string }>
  tools?: string[]
  hints?: string
}

function mapListItemToRecipe(item: CookidooRecipeListItem): CookidooRecipe {
  return {
    id: item.id ?? item.recipeId ?? '',
    name: item.name ?? item.title ?? '',
    imageUrl: item.imageUrl ?? item.image?.url,
    totalTime: item.totalTime,
    prepTime: item.prepTime,
    servings: item.servings ?? item.yield?.value,
  }
}
