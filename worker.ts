import { handler as analyzeStyle } from './functions/api/analyze-style'
import { handler as extractRules } from './functions/api/extract-rules'
import { handler as generateArticle } from './functions/api/generate-article'
import { handler as validateArticle } from './functions/api/validate-article'
import { handler as rewriteArticle } from './functions/api/rewrite-article'

interface Env {
  OPENAI_API_KEY: string
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
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
