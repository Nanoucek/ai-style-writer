import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { generateArticle, validateArticle, rewriteArticle } from '../lib/api'
import ValidationDisplay from '../components/ValidationDisplay'
import type { ArticleInput, GeneratedArticle, ValidationResult } from '../lib/types'

type Step = 'idle' | 'generating' | 'validating' | 'rewriting' | 'done' | 'error'

const EMPTY_INPUT: ArticleInput = {
  title: '',
  key_points: '',
  target_length: '600–900 slov',
  purpose: '',
  target_audience: '',
  additional_info: '',
  supplementary_materials: '',
}

export default function GeneratePage() {
  const { styleProfile, rulesProfile, addArticle } = useApp()
  const navigate = useNavigate()

  const [input, setInput] = useState<ArticleInput>(EMPTY_INPUT)
  const [step, setStep] = useState<Step>('idle')
  const [stepLabel, setStepLabel] = useState('')
  const [error, setError] = useState('')

  const [_draft, setDraft] = useState<GeneratedArticle | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [finalArticle, setFinalArticle] = useState<GeneratedArticle | null>(null)
  const [copied, setCopied] = useState(false)

  if (!styleProfile || !rulesProfile) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-400 text-sm mb-4">
          Pro generování článků nejprve nahraj podklady a vytvoř profily.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          Nahrát podklady
        </button>
      </div>
    )
  }

  const set = (key: keyof ArticleInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setInput((prev) => ({ ...prev, [key]: e.target.value }))

  async function handleGenerate() {
    if (!styleProfile || !rulesProfile) return
    if (!input.title.trim() || !input.key_points.trim()) {
      setError('Vyplň alespoň téma a klíčové body.')
      return
    }
    setError('')
    setDraft(null)
    setValidation(null)
    setFinalArticle(null)

    try {
      // Krok 1: Generování
      setStep('generating')
      setStepLabel('Generuji článek...')
      const generatedDraft = await generateArticle(styleProfile, rulesProfile, input)
      setDraft(generatedDraft)

      // Krok 2: Validace
      setStep('validating')
      setStepLabel('Validuji článek...')
      const validationResult = await validateArticle(generatedDraft, styleProfile, rulesProfile)
      setValidation(validationResult)

      // Krok 3: Auto-přepis pokud skóre < 75 nebo jsou chyby
      let finalDraft = generatedDraft
      if (validationResult.compliance_score < 75 || validationResult.errors?.length > 0) {
        setStep('rewriting')
        setStepLabel('Opravuji nedostatky...')
        finalDraft = await rewriteArticle(generatedDraft, validationResult, styleProfile, rulesProfile)
      }

      setFinalArticle(finalDraft)
      setStep('done')
      setStepLabel('')

      // Uložit do historie
      addArticle({
        id: crypto.randomUUID(),
        input,
        draft: generatedDraft,
        validation: validationResult,
        final: finalDraft,
        created_at: new Date().toISOString(),
      })
    } catch (e) {
      setStep('error')
      setError(e instanceof Error ? e.message : 'Nastala neočekávaná chyba')
    }
  }

  function copyToClipboard() {
    if (!finalArticle) return
    const text = [
      finalArticle.title,
      '',
      finalArticle.perex,
      '',
      finalArticle.body,
      '',
      finalArticle.conclusion,
      finalArticle.cta ? `\n${finalArticle.cta}` : '',
    ]
      .filter((l) => l !== undefined)
      .join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function reset() {
    setStep('idle')
    setDraft(null)
    setValidation(null)
    setFinalArticle(null)
    setInput(EMPTY_INPUT)
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-white mb-1">Generovat článek</h2>
      <p className="text-gray-400 text-sm mb-8">
        Vyplň zadání — aplikace vygeneruje, zvaliduje a opraví článek automaticky.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulář */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-white">Zadání článku</h3>

          <Field label="Téma / název článku *">
            <input
              type="text"
              value={input.title}
              onChange={set('title')}
              placeholder="např. Jak vybrat správný účetní software"
              className={inputCls}
            />
          </Field>

          <Field label="Klíčové body k pokrytí *">
            <textarea
              value={input.key_points}
              onChange={set('key_points')}
              rows={4}
              placeholder="Každý bod na nový řádek nebo odděluj čárkou..."
              className={`${inputCls} resize-none`}
            />
          </Field>

          <Field label="Cílová délka">
            <select value={input.target_length} onChange={set('target_length')} className={inputCls}>
              <option>300–500 slov</option>
              <option>600–900 slov</option>
              <option>1000–1500 slov</option>
              <option>1500–2500 slov</option>
              <option>2500+ slov</option>
            </select>
          </Field>

          <Field label="Účel článku">
            <input
              type="text"
              value={input.purpose}
              onChange={set('purpose')}
              placeholder="např. Edukace, lead generation, SEO..."
              className={inputCls}
            />
          </Field>

          <Field label="Cílová skupina">
            <input
              type="text"
              value={input.target_audience}
              onChange={set('target_audience')}
              placeholder="např. Majitelé malých firem, 35–55 let..."
              className={inputCls}
            />
          </Field>

          <Field label="Doplňující informace">
            <textarea
              value={input.additional_info}
              onChange={set('additional_info')}
              rows={2}
              placeholder="Kontext, specifické požadavky..."
              className={`${inputCls} resize-none`}
            />
          </Field>

          <Field label="Podklady a fakta">
            <textarea
              value={input.supplementary_materials}
              onChange={set('supplementary_materials')}
              rows={4}
              placeholder="Vlož sem fakta, statistiky, citace — AI použije POUZE tato fakta a nevymyslí vlastní."
              className={`${inputCls} resize-none`}
            />
          </Field>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={step === 'generating' || step === 'validating' || step === 'rewriting'}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition-colors"
          >
            {step === 'idle' || step === 'done' || step === 'error'
              ? 'Generovat článek'
              : stepLabel}
          </button>

          {step === 'done' && (
            <button
              onClick={reset}
              className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
            >
              Nový článek
            </button>
          )}
        </section>

        {/* Výstup */}
        <div className="space-y-4">
          {/* Progress */}
          {(step === 'generating' || step === 'validating' || step === 'rewriting') && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <ProgressSteps current={step} />
            </div>
          )}

          {/* Validace */}
          {validation && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-4">Výsledek validace</h3>
              <ValidationDisplay validation={validation} />
            </div>
          )}

          {/* Výsledný článek */}
          {finalArticle && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">
                  Výsledný článek
                  {finalArticle.is_rewrite && (
                    <span className="ml-2 text-xs text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full">
                      Auto-opraveno
                    </span>
                  )}
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? 'Zkopírováno!' : 'Kopírovat'}
                </button>
              </div>
              <ArticleOutput article={finalArticle} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-400 block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function ArticleOutput({ article }: { article: GeneratedArticle }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs text-gray-500 mb-1">Titulek</p>
        <p className="text-white font-semibold text-base">{article.title}</p>
      </div>
      {article.perex && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Perex</p>
          <p className="text-gray-300 leading-relaxed">{article.perex}</p>
        </div>
      )}
      <div>
        <p className="text-xs text-gray-500 mb-1">Tělo článku</p>
        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
          {article.body}
        </div>
      </div>
      {article.conclusion && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Závěr</p>
          <p className="text-gray-300 leading-relaxed">{article.conclusion}</p>
        </div>
      )}
      {article.cta && (
        <div>
          <p className="text-xs text-gray-500 mb-1">CTA</p>
          <p className="text-brand-300">{article.cta}</p>
        </div>
      )}
      {(article.seo_title || article.meta_description) && (
        <div className="border-t border-gray-800 pt-4 space-y-2">
          <p className="text-xs text-gray-500 font-medium">SEO metadata</p>
          {article.seo_title && (
            <div>
              <p className="text-xs text-gray-600 mb-0.5">SEO titulek</p>
              <p className="text-gray-400 text-xs">{article.seo_title}</p>
            </div>
          )}
          {article.meta_description && (
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Meta popis</p>
              <p className="text-gray-400 text-xs">{article.meta_description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProgressSteps({ current }: { current: Step }) {
  const steps = [
    { key: 'generating', label: 'Generování článku' },
    { key: 'validating', label: 'Validace' },
    { key: 'rewriting', label: 'Auto-oprava' },
  ]

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 mb-4">Zpracovávám...</p>
      {steps.map((s) => {
        const stepOrder = ['generating', 'validating', 'rewriting']
        const currentIdx = stepOrder.indexOf(current)
        const stepIdx = stepOrder.indexOf(s.key)
        const isActive = s.key === current
        const isDone = stepIdx < currentIdx

        return (
          <div key={s.key} className="flex items-center gap-3">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                isDone
                  ? 'bg-green-600 text-white'
                  : isActive
                  ? 'bg-brand-600 text-white animate-pulse'
                  : 'bg-gray-800 text-gray-600'
              }`}
            >
              {isDone ? '✓' : stepIdx + 1}
            </span>
            <span
              className={`text-sm ${
                isActive ? 'text-white' : isDone ? 'text-green-400' : 'text-gray-600'
              }`}
            >
              {s.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const inputCls =
  'w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500'
