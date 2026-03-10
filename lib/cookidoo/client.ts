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

const BASE_URL = 'https://cookidoo.de'
const REQUEST_TIMEOUT_MS = 10_000
const MAX_RETRIES = 2

// ─── Client ─────────────────────────────────────────────────────────────────

/**
 * TypeScript client for the Cookidoo REST API (reverse-engineered).
 *
 * Authentication uses the `_oauth2_proxy` cookie (JWT token).
 * Based on the cookiput project: https://github.com/croeer/cookiput
 * and the cookidoo-api Python library: https://github.com/miaucl/cookidoo-api
 */
export class CookidooClient {
  private jwtToken: string | null = null

  private get headers(): Record<string, string> {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; HiboeHub/1.0)',
    }
  }

  private get cookieHeader(): string {
    if (!this.jwtToken) throw new Error('Nicht bei Cookidoo angemeldet')
    return `_oauth2_proxy=${this.jwtToken}`
  }

  // ─── Auth ───────────────────────────────────────────────────────────────

  /**
   * Login to Cookidoo with email and password.
   * Obtains the JWT token from the _oauth2_proxy cookie.
   */
  async login(credentials: CookidooCredentials): Promise<void> {
    const { email, password } = credentials

    // Cookidoo uses OAuth2 proxy for auth. We attempt to login via
    // the sign-in endpoint and capture the _oauth2_proxy cookie.
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(`${BASE_URL}/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (compatible; HiboeHub/1.0)',
        },
        body: new URLSearchParams({ email, password }),
        redirect: 'manual', // Don't follow redirects, we need the cookies
        signal: controller.signal,
      })

      // Extract the _oauth2_proxy cookie from Set-Cookie headers
      const setCookie = response.headers.get('set-cookie') ?? ''
      const match = setCookie.match(/_oauth2_proxy=([^;]+)/)

      if (match) {
        this.jwtToken = match[1]
        return
      }

      // If no cookie was returned, auth may have failed
      if (response.status >= 400) {
        throw new Error(`Cookidoo-Login fehlgeschlagen (Status ${response.status})`)
      }

      throw new Error('Cookidoo-Login fehlgeschlagen: Kein Auth-Token erhalten')
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Set a JWT token directly (e.g. from stored credentials).
   */
  setToken(token: string): void {
    this.jwtToken = token
  }

  /**
   * Check if the client has a valid token.
   */
  isAuthenticated(): boolean {
    return this.jwtToken !== null
  }

  // ─── Read Operations ──────────────────────────────────────────────────

  /**
   * Search for recipes in Cookidoo.
   */
  async searchRecipes(query: string): Promise<CookidooRecipe[]> {
    const params = new URLSearchParams({
      query,
      country: 'de',
      language: 'de-DE',
    })

    const data = await this.request<{ recipes?: CookidooRecipeListItem[] }>(
      `/search/de-DE?${params}`,
      'GET',
    )

    return (data.recipes ?? []).map(mapListItemToRecipe)
  }

  /**
   * Get the user's recipe collections (favorites, custom folders).
   */
  async getCollections(): Promise<CookidooCollection[]> {
    const data = await this.request<{ collections?: CookidooCollectionRaw[] }>(
      '/organize/de-DE/collections',
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
      `/organize/de-DE/collections/${collectionId}/recipes`,
      'GET',
    )

    return (data.recipes ?? []).map(mapListItemToRecipe)
  }

  /**
   * Get full recipe details by ID.
   */
  async getRecipeDetails(recipeId: string): Promise<CookidooRecipeDetail> {
    const data = await this.request<CookidooRecipeDetailRaw>(
      `/recipes/de-DE/${recipeId}`,
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
      '/created-recipes/de-DE',
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
      `/created-recipes/de-DE/${recipeId}`,
      'PATCH',
      { ingredients },
    )
  }

  /**
   * Update instructions of a custom recipe.
   */
  async updateInstructions(recipeId: string, instructions: CookidooStep[]): Promise<void> {
    await this.request(
      `/created-recipes/de-DE/${recipeId}`,
      'PATCH',
      { instructions },
    )
  }

  /**
   * Update metadata (tools, times, yield) of a custom recipe.
   */
  async updateMetadata(recipeId: string, meta: CookidooMeta): Promise<void> {
    await this.request(
      `/created-recipes/de-DE/${recipeId}`,
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
        const response = await fetch(`${BASE_URL}${path}`, {
          method,
          headers: {
            ...this.headers,
            'Cookie': this.cookieHeader,
          },
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
