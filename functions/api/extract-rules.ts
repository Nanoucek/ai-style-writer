import OpenAI from 'openai'

interface Env {
  OPENAI_API_KEY: string
}

export async function handler(request: Request, env: Env): Promise<Response> {
  if (!env.OPENAI_API_KEY) {
    return Response.json({ error: 'OPENAI_API_KEY není nastaven' }, { status: 500 })
  }

  let body: { rulesText: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Neplatný JSON' }, { status: 400 })
  }

  const { rulesText } = body
  if (!rulesText?.trim()) {
    return Response.json({ error: 'Žádný text s pravidly' }, { status: 400 })
  }

  try {
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Jsi expert na analýzu a strukturování pravidel psaní a editorial guidelines. Z dodaných materiálů vytváříš přehledný a přesný profil pravidel. Vracíš POUZE validní JSON objekt.',
        },
        {
          role: 'user',
          content: `Extrahuj a strukturuj všechna pravidla psaní z následujícího dokumentu. Každé pravidlo formuluj jako jasnou, konkrétní instrukci.

Vrať JSON objekt s přesně těmito klíči:
{
  "hard_rules": ["pravidla která MUSÍ být vždy dodržena"],
  "soft_rules": ["doporučení a preference, ne absolutní povinnosti"],
  "forbidden_elements": ["věci které NESMÍ být v textu"],
  "required_elements": ["věci které MUSÍ být v každém textu"],
  "formatting_rules": ["pravidla pro formátování, nadpisy, odstavce, seznamy"],
  "seo_rules": ["pravidla pro SEO optimalizaci"],
  "length_rules": ["pravidla pro délku textu, odstavců, vět"],
  "style_constraints": ["omezení stylu, jazyka, osoby, tónu"],
  "validation_rules": ["co zkontrolovat před odevzdáním textu"]
}

Dokument s pravidly:
${rulesText}`,
        },
      ],
    })

    const profile = JSON.parse(completion.choices[0].message.content ?? '{}')
    profile.extracted_at = new Date().toISOString()

    return Response.json({ profile })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Neznámá chyba'
    return Response.json({ error: `Chyba OpenAI: ${message}` }, { status: 500 })
  }
}
