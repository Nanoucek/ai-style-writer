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
    styleProfile: Record<string, unknown>
    rulesProfile: Record<string, unknown>
  }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Neplatný JSON' }, { status: 400 })
  }

  const { article, styleProfile, rulesProfile } = body

  try {
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Jsi přísný editor a korektor. Validuješ články podle stylového profilu a pravidel. Jsi velmi důkladný a hledáš všechna porušení. Vracíš POUZE validní JSON objekt.',
        },
        {
          role: 'user',
          content: `Zkontroluj článek a ověř, zda odpovídá stylovému profilu a dodržuje všechna pravidla.

STYLOVÝ PROFIL:
${JSON.stringify(styleProfile, null, 2)}

PRAVIDLA:
${JSON.stringify(rulesProfile, null, 2)}

ČLÁNEK K VALIDACI:
Titulek: ${article.title}
Perex: ${article.perex}
Tělo:
${article.body}
Závěr: ${article.conclusion}
CTA: ${article.cta || '(neuvedeno)'}
SEO titulek: ${article.seo_title || '(neuvedeno)'}
Meta popis: ${article.meta_description || '(neuvedeno)'}

Zkontroluj:
1. Odpovídá styl tónu profilu?
2. Jsou dodržena všechna hard rules?
3. Nejsou přítomny zakázané prvky?
4. Jsou přítomny všechny povinné prvky?
5. Odpovídá délka a struktura pravidlům?
6. Je správný tón a formálnost?
7. Jsou splněna SEO pravidla?

Vrať JSON:
{
  "errors": [
    {"rule": "název porušeného pravidla", "description": "popis problému", "location": "kde v textu se nachází"}
  ],
  "warnings": [
    {"rule": "název doporučení", "description": "popis doporučení"}
  ],
  "compliance_score": 85,
  "recommendations": ["konkrétní doporučení pro zlepšení"]
}

compliance_score je číslo 0-100. 100 = dokonalé splnění všech pravidel.`,
        },
      ],
    })

    const validation = JSON.parse(completion.choices[0].message.content ?? '{}')
    validation.validated_at = new Date().toISOString()

    return Response.json({ validation })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Neznámá chyba'
    return Response.json({ error: `Chyba OpenAI: ${message}` }, { status: 500 })
  }
}
