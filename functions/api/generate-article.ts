import OpenAI from 'openai'

interface Env {
  OPENAI_API_KEY: string
}

function buildSystemPrompt(style: Record<string, unknown>, rules: Record<string, unknown>): string {
  const preferredPhrases = Array.isArray(style.preferred_phrases)
    ? (style.preferred_phrases as string[]).join(', ') : ''
  const forbiddenPatterns = Array.isArray(style.forbidden_patterns)
    ? (style.forbidden_patterns as string[]).join(', ') : ''
  const hardRules = Array.isArray(rules.hard_rules)
    ? (rules.hard_rules as string[]).map((r) => `- ${r}`).join('\n') : ''
  const forbiddenElements = Array.isArray(rules.forbidden_elements)
    ? (rules.forbidden_elements as string[]).map((r) => `- ${r}`).join('\n') : ''
  const requiredElements = Array.isArray(rules.required_elements)
    ? (rules.required_elements as string[]).map((r) => `- ${r}`).join('\n') : ''
  const formattingRules = Array.isArray(rules.formatting_rules)
    ? (rules.formatting_rules as string[]).map((r) => `- ${r}`).join('\n') : ''
  const seoRules = Array.isArray(rules.seo_rules)
    ? (rules.seo_rules as string[]).map((r) => `- ${r}`).join('\n') : ''
  const lengthRules = Array.isArray(rules.length_rules)
    ? (rules.length_rules as string[]).map((r) => `- ${r}`).join('\n') : ''

  return `Jsi profesionální copywriter. Píšeš články přesně podle zadaného stylového profilu a pravidel. Nikdy nevymýšlíš fakta, která nejsou v zadání.

STYLOVÝ PROFIL AUTORA:
- Tón: ${style.tone ?? 'neuvedeno'}
- Délka vět: ${style.sentence_length ?? 'neuvedeno'}
- Styl odstavců: ${style.paragraph_style ?? 'neuvedeno'}
- Styl nadpisů: ${style.heading_style ?? 'neuvedeno'}
- Formálnost: ${style.formality ?? 'neuvedeno'}
- Odbornost: ${style.expertise_level ?? 'neuvedeno'}
- Preferované fráze: ${preferredPhrases || 'neuvedeno'}
- Zakázané vzory: ${forbiddenPatterns || 'neuvedeno'}
- Styl otevření: ${style.opening_style ?? 'neuvedeno'}
- Styl závěru: ${style.closing_style ?? 'neuvedeno'}
- CTA styl: ${style.cta_style ?? 'neuvedeno'}
- Rytmus textu: ${style.text_rhythm ?? 'neuvedeno'}

POVINNÁ PRAVIDLA (musí být VŽDY dodržena):
${hardRules || '- žádná specifikovaná'}
ZAKÁZANÉ PRVKY:
${forbiddenElements || '- žádné specifikované'}
POVINNÉ PRVKY:
${requiredElements || '- žádné specifikované'}
FORMÁTOVACÍ PRAVIDLA:
${formattingRules || '- žádná specifikovaná'}
SEO PRAVIDLA:
${seoRules || '- žádná specifikovaná'}
PRAVIDLA DÉLKY:
${lengthRules || '- žádná specifikovaná'}

Vracíš POUZE validní JSON objekt.`
}

export async function handler(request: Request, env: Env): Promise<Response> {
  if (!env.OPENAI_API_KEY) {
    return Response.json({ error: 'OPENAI_API_KEY není nastaven' }, { status: 500 })
  }

  let body: {
    styleProfile: Record<string, unknown>
    rulesProfile: Record<string, unknown>
    articleInput: Record<string, string>
  }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Neplatný JSON' }, { status: 400 })
  }

  const { styleProfile, rulesProfile, articleInput } = body
  if (!styleProfile || !rulesProfile || !articleInput) {
    return Response.json({ error: 'Chybí stylový profil, pravidla nebo zadání článku' }, { status: 400 })
  }

  try {
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      max_tokens: 4096,
      messages: [
        { role: 'system', content: buildSystemPrompt(styleProfile, rulesProfile) },
        {
          role: 'user',
          content: `Napiš článek přesně podle stylového profilu a pravidel.

ZADÁNÍ ČLÁNKU:
Téma / název: ${articleInput.title}
Klíčové body k pokrytí: ${articleInput.key_points}
Cílová délka: ${articleInput.target_length}
Účel článku: ${articleInput.purpose}
Cílová skupina: ${articleInput.target_audience}
Doplňující informace: ${articleInput.additional_info || 'neuvedeno'}
${articleInput.supplementary_materials ? `\nDodané podklady a fakta:\n${articleInput.supplementary_materials}` : ''}

Vrať JSON objekt:
{
  "title": "finální titulek článku",
  "perex": "úvodní odstavec / perex",
  "body": "hlavní tělo článku v Markdown formátu s nadpisy (## a ###)",
  "conclusion": "závěrečný odstavec",
  "cta": "výzva k akci (pokud je relevantní, jinak prázdný string)",
  "seo_title": "SEO titulek do 60 znaků",
  "meta_description": "meta popis do 155 znaků"
}`,
        },
      ],
    })

    const article = JSON.parse(completion.choices[0].message.content ?? '{}')
    article.generated_at = new Date().toISOString()

    return Response.json({ article })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Neznámá chyba'
    return Response.json({ error: `Chyba OpenAI: ${message}` }, { status: 500 })
  }
}
