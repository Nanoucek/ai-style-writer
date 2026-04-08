import { handler as analyzeStyle } from './functions/api/analyze-style'
import { handler as extractRules } from './functions/api/extract-rules'
import { handler as generateArticle } from './functions/api/generate-article'
import { handler as validateArticle } from './functions/api/validate-article'
import { handler as rewriteArticle } from './functions/api/rewrite-article'

interface Env {
  OPENAI_API_KEY: string
  APP_PASSWORD: string
  ASSETS: Fetcher
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function withCors(response: Response): Response {
  const r = new Response(response.body, response)
  for (const [k, v] of Object.entries(CORS_HEADERS)) r.headers.set(k, v)
  return r
}

function unauthorized(): Response {
  return new Response('Přístup odepřen. Zadej heslo.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="AI Style Writer"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}

function checkAuth(request: Request, password: string): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Basic ')) return false

  const encoded = authHeader.slice(6)
  const decoded = atob(encoded)
  // Formát je "uzivatel:heslo" – akceptujeme libovolné uživatelské jméno
  const userPassword = decoded.split(':').slice(1).join(':')
  return userPassword === password
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight – nepotřebuje auth
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    // Ochrana heslem (pouze pokud je APP_PASSWORD nastaven)
    if (env.APP_PASSWORD) {
      if (!checkAuth(request, env.APP_PASSWORD)) {
        return unauthorized()
      }
    }

    const { pathname } = new URL(request.url)

    // API routes (POST only)
    if (request.method === 'POST') {
      if (pathname === '/api/analyze-style') return withCors(await analyzeStyle(request, env))
      if (pathname === '/api/extract-rules') return withCors(await extractRules(request, env))
      if (pathname === '/api/generate-article') return withCors(await generateArticle(request, env))
      if (pathname === '/api/validate-article') return withCors(await validateArticle(request, env))
      if (pathname === '/api/rewrite-article') return withCors(await rewriteArticle(request, env))
    }

    // Vše ostatní → statické soubory React aplikace
    return env.ASSETS.fetch(request)
  },
}
