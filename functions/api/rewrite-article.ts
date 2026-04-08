import OpenAI from 'openai'

interface Env {
  OPENAI_API_KEY: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (!env.OPENAI_API_KEY) {
    return Response.json({ error: 'OPENAI_API_KEY není nastaven' }, { status: 500 })
  }

  let body: {
    article: Record<string, string>
    validation: Record<string, unknown>
    styleProfile: Record<string, unknown>
    rulesProfile: Record<string, unknown>
  }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Neplatný JSON' }, { status: 400 })
  }

  const { article, validation, styleProfile, rulesProfile } = body

  const errors = Array.isArray(validation.errors)
    ? (validation.errors as Array<{ rule: string; description: string; location?: string }>)
        .map((e) => `- [CHYBA] ${e.rule}: ${e.description}${e.location ? ` (${e.location})` : ''}`)
        .join('\n')
    : ''

  const warnings = Array.isArray(validation.warnings)
    ? (validation.warnings as Array<{ rule: string; description: string }>)
        .map((w) => `- [VAROVÁNÍ] ${w.rule}: ${w.description}`)
        .join('\n')
    : ''

  const recommendations = Array.isArray(validation.recommendations)
    ? (validation.recommendations as string[]).map((r) => `- ${r}`).join('\n')
    : ''

  const preferredPhrases = Array.isArray(styleProfile.preferred_phrases)
    ? (styleProfile.preferred_phrases as string[]).join(', ')
    : ''
  const forbiddenPatterns = Array.isArray(styleProfile.forbidden_patterns)
    ? (styleProfile.forbidden_patterns as string[]).join(', ')
    : ''
  const hardRules = Array.isArray(rulesProfile.hard_rules)
    ? (rulesProfile.hard_rules as string[]).map((r) => `- ${r}`).join('\n')
    : ''
  const forbiddenElements = Array.isArray(rulesProfile.forbidden_elements)
    ? (rulesProfile.forbidden_elements as string[]).map((r) => `- ${r}`).join('\n')
    : ''

  try {
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      max_tokens: 4096,
      messages: [
        {
          role: 'system',
          content: `Jsi profesionální editor a copywriter. Přepisuješ texty tak, aby opravily VŠECHNY nalezené chyby a přesně odpovídaly stylovému profilu a pravidlům. Zachováváš původní obsah a fakta.

STYLOVÝ PROFIL:
- Tón: ${styleProfile.tone ?? 'neuvedeno'}
- Délka vět: ${styleProfile.sentence_length ?? 'neuvedeno'}
- Formálnost: ${styleProfile.formality ?? 'neuvedeno'}
- Styl odstavců: ${styleProfile.paragraph_style ?? 'neuvedeno'}
- Preferované fráze: ${preferredPhrases || 'neuvedeno'}
- Zakázané vzory: ${forbiddenPatterns || 'neuvedeno'}
- Styl otevření: ${styleProfile.opening_style ?? 'neuvedeno'}
- Styl závěru: ${styleProfile.closing_style ?? 'neuvedeno'}

POVINNÁ PRAVIDLA:
${hardRules || '- žádná'}
ZAKÁZANÉ PRVKY:
${forbiddenElements || '- žádné'}

Vracíš POUZE validní JSON objekt.`,
        },
        {
          role: 'user',
          content: `Přepiš článek a oprav VŠECHNY nalezené problémy. Zachovej fakta a obsah.

PROBLÉMY K OPRAVENÍ:
${errors || '(žádné kritické chyby)'}

VAROVÁNÍ:
${warnings || '(žádná)'}

DOPORUČENÍ:
${recommendations || '(žádná)'}

PŮVODNÍ ČLÁNEK:
Titulek: ${article.title}
Perex: ${article.perex}
Tělo:
${article.body}
Závěr: ${article.conclusion}
CTA: ${article.cta || ''}
SEO titulek: ${article.seo_title || ''}
Meta popis: ${article.meta_description || ''}

Vrať JSON:
{
  "title": "...",
  "perex": "...",
  "body": "...",
  "conclusion": "...",
  "cta": "...",
  "seo_title": "...",
  "meta_description": "..."
}`,
        },
      ],
    })

    const rewritten = JSON.parse(completion.choices[0].message.content ?? '{}')
    rewritten.generated_at = new Date().toISOString()
    rewritten.is_rewrite = true

    return Response.json({ article: rewritten })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Neznámá chyba'
    return Response.json({ error: `Chyba OpenAI: ${message}` }, { status: 500 })
  }
}
