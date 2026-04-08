import type { ValidationResult } from '../lib/types'

interface Props {
  validation: ValidationResult
}

export default function ValidationDisplay({ validation }: Props) {
  const score = validation.compliance_score ?? 0
  const scoreColor =
    score >= 85 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
  const barColor =
    score >= 85 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Skóre shody</span>
          <span className={`text-2xl font-bold ${scoreColor}`}>{score}/100</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Errors */}
      {validation.errors?.length > 0 && (
        <section>
          <h4 className="text-sm font-medium text-red-400 mb-2">
            Chyby ({validation.errors.length})
          </h4>
          <ul className="space-y-2">
            {validation.errors.map((e, i) => (
              <li key={i} className="bg-red-950/40 border border-red-900/50 rounded-lg p-3">
                <p className="text-sm font-medium text-red-300">{e.rule}</p>
                <p className="text-xs text-red-400 mt-0.5">{e.description}</p>
                {e.location && (
                  <p className="text-xs text-red-600 mt-0.5">Místo: {e.location}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Warnings */}
      {validation.warnings?.length > 0 && (
        <section>
          <h4 className="text-sm font-medium text-yellow-400 mb-2">
            Varování ({validation.warnings.length})
          </h4>
          <ul className="space-y-2">
            {validation.warnings.map((w, i) => (
              <li key={i} className="bg-yellow-950/30 border border-yellow-900/40 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-300">{w.rule}</p>
                <p className="text-xs text-yellow-500 mt-0.5">{w.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recommendations */}
      {validation.recommendations?.length > 0 && (
        <section>
          <h4 className="text-sm font-medium text-blue-400 mb-2">Doporučení</h4>
          <ul className="space-y-1.5">
            {validation.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-400">
                <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                {r}
              </li>
            ))}
          </ul>
        </section>
      )}

      {validation.errors?.length === 0 && validation.warnings?.length === 0 && (
        <p className="text-green-400 text-sm text-center py-2">
          Článek prošel validací bez problémů.
        </p>
      )}
    </div>
  )
}
