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

    const data = await this.request<Record<string, unknown>>(
      `/search/${LANGUAGE}?${params}`,
      'GET',
    )

    console.log('[Cookidoo] search raw keys:', Object.keys(data))
    console.log('[Cookidoo] search raw:', JSON.stringify(data).slice(0, 500))

    // Try to extract recipe list from various possible response shapes
    const recipes = extractRecipesFromSearchResponse(data)
    if (recipes.length > 0) {
      return recipes.map(mapListItemToRecipe)
    }

    // If the response only contains recipe IDs (like collections), fetch summaries
    const recipeIds = (data.recipeIds as string[]) ?? []
    if (recipeIds.length > 0) {
      return this.fetchRecipeSummaries(recipeIds)
    }

    return []
  }

  /**
   * Get the user's recipe collections (both custom and managed/favorites).
   */
  async getCollections(): Promise<CookidooCollection[]> {
    // Fetch both custom lists and managed lists (Merkliste/Favoriten) in parallel
    const [customResult, managedResult] = await Promise.allSettled([
      this.request<Record<string, unknown>>(
        `/organize/${LANGUAGE}/api/custom-list`,
        'GET',
      ),
      this.request<Record<string, unknown>>(
        `/organize/${LANGUAGE}/api/managed-list`,
        'GET',
      ),
    ])

    const customData = customResult.status === 'fulfilled' ? customResult.value : null
    const managedData = managedResult.status === 'fulfilled' ? managedResult.value : null

    // Debug: log raw responses to help identify the correct response shape
    console.log('[Cookidoo] custom-list raw keys:', customData ? Object.keys(customData) : 'ERROR',
      customResult.status === 'rejected' ? (customResult.reason as Error)?.message : '')
    console.log('[Cookidoo] managed-list raw keys:', managedData ? Object.keys(managedData) : 'ERROR',
      managedResult.status === 'rejected' ? (managedResult.reason as Error)?.message : '')
    console.log('[Cookidoo] custom-list raw:', JSON.stringify(customData).slice(0, 500))
    console.log('[Cookidoo] managed-list raw:', JSON.stringify(managedData).slice(0, 500))

    const mapCollection = (listType: 'custom' | 'managed') => (c: CookidooCollectionRaw): CookidooCollection => ({
      id: c.id ?? c.collectionId ?? '',
      name: c.name ?? c.title ?? 'Unbenannt',
      recipeCount: c.recipeCount ?? c.totalRecipes ?? c.recipesCount ?? 0,
      listType,
    })

    const custom = extractCollections(customData as CookidooCollectionsResponse | null).map(mapCollection('custom'))
    const managed = extractCollections(managedData as CookidooCollectionsResponse | null).map(mapCollection('managed'))

    return [...managed, ...custom]
  }

  /**
   * Get recipes from a specific collection.
   * The API only returns recipe IDs, so we fetch summaries in parallel.
   * @param listType - 'custom' for user-created lists, 'managed' for Merkliste/favorites
   */
  async getCollectionRecipes(
    collectionId: string,
    listType: 'custom' | 'managed' = 'custom',
  ): Promise<CookidooRecipe[]> {
    const listPath = listType === 'managed' ? 'managed-list' : 'custom-list'
    const data = await this.request<Record<string, unknown>>(
      `/organize/${LANGUAGE}/api/${listPath}/${collectionId}`,
      'GET',
    )

    // The API returns { recipeIds: ["r762353", ...], ... } — just IDs, no recipe objects
    const recipeIds = (data.recipeIds as string[]) ?? []
    if (recipeIds.length === 0) return []

    return this.fetchRecipeSummaries(recipeIds)
  }

  /**
   * Fetch basic recipe info for multiple IDs in parallel (with concurrency limit).
   */
  private async fetchRecipeSummaries(recipeIds: string[]): Promise<CookidooRecipe[]> {
    const CONCURRENCY = 5
    const results: CookidooRecipe[] = []

    for (let i = 0; i < recipeIds.length; i += CONCURRENCY) {
      const batch = recipeIds.slice(i, i + CONCURRENCY)
      const batchResults = await Promise.allSettled(
        batch.map(async (id) => {
          try {
            const data = await this.request<CookidooRecipeDetailRaw>(
              `/recipes/recipe/${LANGUAGE}/${id}`,
              'GET',
            )
            return {
              id,
              name: data.name ?? data.title ?? id,
              imageUrl: data.imageUrl ?? data.image?.url,
              totalTime: data.totalTime,
              prepTime: data.prepTime,
              servings: data.yield?.value ?? data.servings,
            } satisfies CookidooRecipe
          } catch {
            // Return minimal recipe if details can't be fetched
            return { id, name: id } satisfies CookidooRecipe
          }
        }),
      )

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        }
      }
    }

    return results
  }

  /**
   * Get full recipe details by ID.
   */
  async getRecipeDetails(recipeId: string): Promise<CookidooRecipeDetail> {
    const data = await this.request<Record<string, unknown>>(
      `/recipes/recipe/${LANGUAGE}/${recipeId}`,
      'GET',
    )

    console.log('[Cookidoo] recipe-detail raw keys:', Object.keys(data))
    console.log('[Cookidoo] recipe-detail raw:', JSON.stringify(data).slice(0, 1000))

    const raw = data as CookidooRecipeDetailRaw
    return {
      id: recipeId,
      name: raw.name ?? raw.title ?? '',
      description: raw.description,
      imageUrl: raw.imageUrl ?? raw.image?.url,
      totalTime: raw.totalTime,
      prepTime: raw.prepTime,
      servings: raw.yield?.value ?? raw.servings,
      ingredients: (raw.ingredients ?? []).map((i) => ({
        type: (i.type ?? 'INGREDIENT') as 'INGREDIENT' | 'HEADER',
        text: i.text ?? i.name ?? '',
      })),
      instructions: (raw.instructions ?? raw.steps ?? []).map((s) => ({
        type: 'STEP' as const,
        text: s.text ?? s.description ?? '',
      })),
      tools: raw.tools ?? [],
      hints: raw.hints,
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
  recipesCount?: number
  totalRecipes?: number
}

// The API may return collections in different wrapper shapes
type CookidooCollectionsResponse = {
  customlists?: CookidooCollectionRaw[]
  managedlists?: CookidooCollectionRaw[]
  collections?: CookidooCollectionRaw[]
  customCollections?: CookidooCollectionRaw[]
  managedCollections?: CookidooCollectionRaw[]
} | CookidooCollectionRaw[]

function extractCollections(data: CookidooCollectionsResponse | null): CookidooCollectionRaw[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  return data.customlists ?? data.managedlists ?? data.collections ?? data.customCollections ?? data.managedCollections ?? []
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

// The API may return recipes in different wrapper shapes
type CookidooCollectionRecipesResponse = {
  recipes?: CookidooRecipeListItem[]
  recipeList?: CookidooRecipeListItem[]
} | CookidooRecipeListItem[]

function extractRecipesFromResponse(data: CookidooCollectionRecipesResponse): CookidooRecipeListItem[] {
  if (Array.isArray(data)) return data
  return data.recipes ?? data.recipeList ?? []
}

/**
 * Extract recipes from search response, trying multiple possible keys.
 */
function extractRecipesFromSearchResponse(data: Record<string, unknown>): CookidooRecipeListItem[] {
  // Try common keys for search results
  for (const key of ['recipes', 'recipeList', 'results', 'hits', 'searchResults', 'content', 'items']) {
    const val = data[key]
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
      // Check if items look like recipe objects (have name/title and id)
      const first = val[0] as Record<string, unknown>
      if (first.name || first.title || first.id || first.recipeId) {
        return val as CookidooRecipeListItem[]
      }
    }
  }
  return []
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
