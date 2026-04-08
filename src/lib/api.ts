import type {
  StyleProfile,
  RulesProfile,
  ArticleInput,
  GeneratedArticle,
  ValidationResult,
} from './types'

const BASE = '/api'

async function post<T>(endpoint: string, data: unknown): Promise<T> {
  const res = await fetch(`${BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
  return json as T
}

export async function analyzeStyle(articles: string[]): Promise<StyleProfile> {
  const data = await post<{ profile: StyleProfile }>('analyze-style', { articles })
  return data.profile
}

export async function extractRules(rulesText: string): Promise<RulesProfile> {
  const data = await post<{ profile: RulesProfile }>('extract-rules', { rulesText })
  return data.profile
}

export async function generateArticle(
  styleProfile: StyleProfile,
  rulesProfile: RulesProfile,
  articleInput: ArticleInput,
): Promise<GeneratedArticle> {
  const data = await post<{ article: GeneratedArticle }>('generate-article', {
    styleProfile,
    rulesProfile,
    articleInput,
  })
  return data.article
}

export async function validateArticle(
  article: GeneratedArticle,
  styleProfile: StyleProfile,
  rulesProfile: RulesProfile,
): Promise<ValidationResult> {
  const data = await post<{ validation: ValidationResult }>('validate-article', {
    article,
    styleProfile,
    rulesProfile,
  })
  return data.validation
}

export async function rewriteArticle(
  article: GeneratedArticle,
  validation: ValidationResult,
  styleProfile: StyleProfile,
  rulesProfile: RulesProfile,
): Promise<GeneratedArticle> {
  const data = await post<{ article: GeneratedArticle }>('rewrite-article', {
    article,
    validation,
    styleProfile,
    rulesProfile,
  })
  return data.article
}
