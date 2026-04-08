import { useState } from 'react'
import { useApp } from '../context/AppContext'
import ValidationDisplay from '../components/ValidationDisplay'
import type { ArticleRecord } from '../lib/types'

export default function HistoryPage() {
  const { articles } = useApp()
  const [selected, setSelected] = useState<ArticleRecord | null>(null)

  if (articles.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-500 text-sm">Zatím nebyly vygenerovány žádné články.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-white mb-1">Historie článků</h2>
      <p className="text-gray-400 text-sm mb-8">{articles.length} vygenerovaných článků</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seznam */}
        <div className="space-y-2">
          {articles.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className={`w-full text-left bg-gray-900 border rounded-xl p-4 transition-colors ${
                selected?.id === a.id
                  ? 'border-brand-600'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <p className="text-sm font-medium text-white truncate">{a.final.title || a.input.title}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(a.created_at).toLocaleDateString('cs-CZ', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <ScoreBadge score={a.validation.compliance_score} />
                {a.final.is_rewrite && (
                  <span className="text-xs text-yellow-500">Auto-opraveno</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-1">{selected.final.title}</h3>
              <p className="text-xs text-gray-500 mb-4">
                {new Date(selected.created_at).toLocaleDateString('cs-CZ', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>

              <div className="space-y-4 text-sm">
                {selected.final.perex && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Perex</p>
                    <p className="text-gray-300 leading-relaxed">{selected.final.perex}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tělo článku</p>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                    {selected.final.body}
                  </div>
                </div>
                {selected.final.conclusion && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Závěr</p>
                    <p className="text-gray-300 leading-relaxed">{selected.final.conclusion}</p>
                  </div>
                )}
                {selected.final.cta && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">CTA</p>
                    <p className="text-brand-300">{selected.final.cta}</p>
                  </div>
                )}
                {(selected.final.seo_title || selected.final.meta_description) && (
                  <div className="border-t border-gray-800 pt-4 space-y-2">
                    <p className="text-xs text-gray-500 font-medium">SEO metadata</p>
                    {selected.final.seo_title && (
                      <p className="text-gray-400 text-xs">
                        <span className="text-gray-600">SEO titulek: </span>
                        {selected.final.seo_title}
                      </p>
                    )}
                    {selected.final.meta_description && (
                      <p className="text-gray-400 text-xs">
                        <span className="text-gray-600">Meta popis: </span>
                        {selected.final.meta_description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  const text = [
                    selected.final.title, '',
                    selected.final.perex, '',
                    selected.final.body, '',
                    selected.final.conclusion,
                    selected.final.cta,
                  ].filter(Boolean).join('\n')
                  navigator.clipboard.writeText(text)
                }}
                className="mt-4 text-xs border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Kopírovat text
              </button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-white mb-4">Validační zpráva</h4>
              <ValidationDisplay validation={selected.validation} />
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center text-gray-600 text-sm">
            Vyber článek ze seznamu
          </div>
        )}
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85 ? 'text-green-400 bg-green-900/30' :
    score >= 60 ? 'text-yellow-400 bg-yellow-900/30' :
    'text-red-400 bg-red-900/30'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {score}/100
    </span>
  )
}
