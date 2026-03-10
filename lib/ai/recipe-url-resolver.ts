import type { AISuggestion } from '@/lib/types/meals'

// ─── Configuration ──────────────────────────────────────────────────────────

const BRAVE_SEARCH_URL = 'https://api.search.brave.com/res/v1/web/search'
const REQUEST_TIMEOUT_MS = 3_000

/** Domains we trust for recipe content. */
const RECIPE_DOMAINS = [
  'chefkoch.de',
  'eatsmarter.de',
  'familienkost.de',
  'babybrei-selber-machen.de',
  'kochbar.de',
  'lecker.de',
  'einfachbacken.de',
  'gutekueche.de',
  'rewe.de',
  'lidl-kochen.de',
]

// ─── Types ──────────────────────────────────────────────────────────────────

interface BraveWebResult {
  url: string
  title: string
  description: string
}

interface BraveSearchResponse {
  web?: { results: BraveWebResult[] }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getApiKey(): string | undefined {
  return process.env.BRAVE_SEARCH_API_KEY
}

/** Check if a URL belongs to one of the trusted recipe domains. */
function isTrustedRecipeDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return RECIPE_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

/** Build a search query from recipe title and tags. */
function buildSearchQuery(searchQuery: string | undefined, title: string, tags: string[]): string {
  if (searchQuery) return searchQuery
  // Fallback: construct from title + first two tags
  const tagPart = tags.slice(0, 2).join(' ')
  return `${title} Rezept ${tagPart}`.trim()
}

// ─── Core Search ────────────────────────────────────────────────────────────

async function searchRecipeUrl(query: string): Promise<string | null> {
  const apiKey = getApiKey()
  if (!apiKey) return null

  const params = new URLSearchParams({
    q: query,
    count: '5',
    search_lang: 'de',
    country: 'DE',
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${BRAVE_SEARCH_URL}?${params}`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      console.warn(`[recipe-url-resolver] Brave Search returned ${response.status}`)
      return null
    }

    const data: BraveSearchResponse = await response.json()
    const results = data.web?.results ?? []

    // Prefer a result from a trusted recipe domain
    const trustedResult = results.find((r) => isTrustedRecipeDomain(r.url))
    if (trustedResult) return trustedResult.url

    // Fallback: return the first result if it looks like a recipe page
    const first = results[0]
    if (first && /rezept|recipe/i.test(first.url + first.title)) {
      return first.url
    }

    return null
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('[recipe-url-resolver] Search timed out for query:', query)
    } else {
      console.warn('[recipe-url-resolver] Search failed:', err)
    }
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Resolve real recipe URLs for a list of AI suggestions.
 * Searches in parallel, gracefully falls back to null for any failures.
 */
export async function resolveRecipeUrls(
  suggestions: AISuggestion[]
): Promise<AISuggestion[]> {
  const apiKey = getApiKey()
  if (!apiKey) {
    console.warn('[recipe-url-resolver] BRAVE_SEARCH_API_KEY not set, skipping URL resolution')
    return suggestions
  }

  const results = await Promise.allSettled(
    suggestions.map(async (suggestion) => {
      const query = buildSearchQuery(
        suggestion.searchQuery,
        suggestion.recipe.title,
        suggestion.recipe.tags
      )
      const url = await searchRecipeUrl(query)
      return {
        ...suggestion,
        recipe: {
          ...suggestion.recipe,
          sourceUrl: url,
        },
      }
    })
  )

  return results.map((result, i) =>
    result.status === 'fulfilled' ? result.value : suggestions[i]
  )
}

/**
 * Resolve a real recipe URL for a single AI suggestion.
 */
export async function resolveRecipeUrl(
  suggestion: AISuggestion
): Promise<AISuggestion> {
  const [resolved] = await resolveRecipeUrls([suggestion])
  return resolved
}
