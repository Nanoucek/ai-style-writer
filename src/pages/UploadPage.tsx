import { useState } from 'react'
import FileDropzone from '../components/FileDropzone'
import { useApp } from '../context/AppContext'
import { analyzeStyle, extractRules } from '../lib/api'

export default function UploadPage() {
  const { setStyleProfile, setRulesProfile, styleProfile, rulesProfile } = useApp()

  const [articleTexts, setArticleTexts] = useState<string[]>([])
  const [articleManual, setArticleManual] = useState('')
  const [rulesText, setRulesText] = useState('')
  const [rulesManual, setRulesManual] = useState('')

  const [loadingStyle, setLoadingStyle] = useState(false)
  const [loadingRules, setLoadingRules] = useState(false)
  const [errorStyle, setErrorStyle] = useState('')
  const [errorRules, setErrorRules] = useState('')
  const [successStyle, setSuccessStyle] = useState(false)
  const [successRules, setSuccessRules] = useState(false)

  async function handleAnalyzeStyle() {
    const allTexts = [
      ...articleTexts,
      ...(articleManual.trim() ? [articleManual] : []),
    ]
    if (allTexts.length === 0) {
      setErrorStyle('Nahraj alespoň jeden článek nebo vlož text.')
      return
    }
    setLoadingStyle(true)
    setErrorStyle('')
    setSuccessStyle(false)
    try {
      const profile = await analyzeStyle(allTexts)
      setStyleProfile(profile)
      setSuccessStyle(true)
    } catch (e) {
      setErrorStyle(e instanceof Error ? e.message : 'Chyba při analýze')
    } finally {
      setLoadingStyle(false)
    }
  }

  async function handleExtractRules() {
    const combined = [rulesText, rulesManual].filter(Boolean).join('\n\n')
    if (!combined.trim()) {
      setErrorRules('Nahraj soubor s pravidly nebo vlož text.')
      return
    }
    setLoadingRules(true)
    setErrorRules('')
    setSuccessRules(false)
    try {
      const profile = await extractRules(combined)
      setRulesProfile(profile)
      setSuccessRules(true)
    } catch (e) {
      setErrorRules(e instanceof Error ? e.message : 'Chyba při extrakci')
    } finally {
      setLoadingRules(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-white mb-1">Nahrát podklady</h2>
      <p className="text-gray-400 text-sm mb-8">
        Nahraj ukázkové články a pravidla psaní. Aplikace z nich vytvoří profily pro generování.
      </p>

      {/* Sekce 1: Ukázkové články */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Ukázkové články</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              5–20 článků z nichž se AI naučí tvůj styl psaní
            </p>
          </div>
          {styleProfile && (
            <span className="text-xs text-green-400 bg-green-900/30 px-2.5 py-1 rounded-full">
              Analyzováno ({styleProfile.article_count ?? '?'} článků)
            </span>
          )}
        </div>

        <FileDropzone
          multiple
          label="Přetáhni články sem nebo klikni pro výběr"
          onTexts={(texts) => setArticleTexts((prev) => [...prev, ...texts])}
        />

        <div className="mt-4">
          <label className="text-xs text-gray-500 block mb-1.5">
            nebo vlož text přímo
          </label>
          <textarea
            value={articleManual}
            onChange={(e) => setArticleManual(e.target.value)}
            rows={4}
            placeholder="Vlož sem text článku..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        {errorStyle && <p className="text-red-400 text-xs mt-2">{errorStyle}</p>}
        {successStyle && (
          <p className="text-green-400 text-xs mt-2">
            Stylový profil byl úspěšně vytvořen.
          </p>
        )}

        <button
          onClick={handleAnalyzeStyle}
          disabled={loadingStyle}
          className="mt-4 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
        >
          {loadingStyle ? 'Analyzuji styl...' : 'Analyzovat styl'}
        </button>
      </section>

      {/* Sekce 2: Pravidla */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Pravidla psaní</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Dokument s editorial guidelines, co smí a nesmí
            </p>
          </div>
          {rulesProfile && (
            <span className="text-xs text-green-400 bg-green-900/30 px-2.5 py-1 rounded-full">
              Extrahováno
            </span>
          )}
        </div>

        <FileDropzone
          multiple={false}
          label="Přetáhni soubor s pravidly nebo klikni"
          onTexts={(texts) => setRulesText(texts[0] ?? '')}
        />

        <div className="mt-4">
          <label className="text-xs text-gray-500 block mb-1.5">
            nebo vlož pravidla přímo
          </label>
          <textarea
            value={rulesManual}
            onChange={(e) => setRulesManual(e.target.value)}
            rows={5}
            placeholder="Vlož sem pravidla psaní..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        {errorRules && <p className="text-red-400 text-xs mt-2">{errorRules}</p>}
        {successRules && (
          <p className="text-green-400 text-xs mt-2">
            Profil pravidel byl úspěšně vytvořen.
          </p>
        )}

        <button
          onClick={handleExtractRules}
          disabled={loadingRules}
          className="mt-4 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
        >
          {loadingRules ? 'Extrahuji pravidla...' : 'Extrahovat pravidla'}
        </button>
      </section>
    </div>
  )
}
