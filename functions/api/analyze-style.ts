import OpenAI from 'openai'

interface Env {
  OPENAI_API_KEY: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (!env.OPENAI_API_KEY) {
    return Response.json({ error: 'OPENAI_API_KEY není nastaven' }, { status: 500 })
  }

  let body: { articles: string[] }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Neplatný JSON' }, { status: 400 })
  }

  const { articles } = body
  if (!articles || articles.length === 0) {
    return Response.json({ error: 'Žádné články k analýze' }, { status: 400 })
  }

  const combinedText = articles
    .map((a, i) => `=== ČLÁNEK ${i + 1} ===\n${a.trim()}`)
    .join('\n\n')

  try {
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Jsi expert na analýzu stylu psaní. Analyzuješ texty a vytváříš přesný stylový profil autora. Vracíš POUZE validní JSON objekt, žádný jiný text.',
        },
        {
          role: 'user',
          content: `Analyzuj styl psaní v následujících článcích a vytvoř podrobný stylový profil autora. Buď konkrétní a přesný.

Vrať JSON objekt s přesně těmito klíči:
{
  "tone": "detailní popis tónu komunikace",
  "sentence_length": "krátké nebo střední nebo dlouhé",
  "paragraph_style": "popis délky a struktury odstavců",
  "heading_style": "popis stylu a přístupu k nadpisům",
  "preferred_phrases": ["konkrétní fráze nebo výrazy které autor opakuje"],
  "forbidden_patterns": ["vzory nebo formulace které autor nepoužívá nebo se jim vyhýbá"],
  "reading_level": "popis cílové úrovně čtenáře",
  "cta_style": "popis jak autor vyzývá k akci",
  "formality": "formální nebo neformální nebo smíšené",
  "expertise_level": "popis jak odborně autor píše",
  "opening_style": "popis jak autor typicky zahajuje texty",
  "closing_style": "popis jak autor typicky ukončuje texty",
  "text_rhythm": "popis rytmu a tempa textu"
}

${combinedText}`,
        },
      ],
    })

    const profile = JSON.parse(completion.choices[0].message.content ?? '{}')
    profile.analyzed_at = new Date().toISOString()
    profile.article_count = articles.length

    return Response.json({ profile })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Neznámá chyba'
    return Response.json({ error: `Chyba OpenAI: ${message}` }, { status: 500 })
  }
}
