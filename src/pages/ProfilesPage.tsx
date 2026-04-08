import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

export default function ProfilesPage() {
  const { styleProfile, rulesProfile, clearProfiles } = useApp()
  const navigate = useNavigate()

  if (!styleProfile && !rulesProfile) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-500 text-sm mb-4">Zatím nejsou vytvořeny žádné profily.</p>
        <button
          onClick={() => navigate('/')}
          className="text-brand-400 hover:text-brand-300 text-sm underline"
        >
          Jít na Nahrát podklady
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Profily</h2>
          <p className="text-gray-400 text-sm mt-0.5">Stylový profil a profil pravidel</p>
        </div>
        <button
          onClick={() => {
            if (confirm('Opravdu chceš smazat oba profily?')) clearProfiles()
          }}
          className="text-xs text-red-500 hover:text-red-400 border border-red-900 hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Smazat profily
        </button>
      </div>

      {styleProfile && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Stylový profil</h3>
            <span className="text-xs text-gray-500">
              Analyzováno: {new Date(styleProfile.analyzed_at).toLocaleDateString('cs-CZ')}
              {styleProfile.article_count ? ` • ${styleProfile.article_count} článků` : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <ProfileRow label="Tón" value={styleProfile.tone} />
            <ProfileRow label="Délka vět" value={styleProfile.sentence_length} />
            <ProfileRow label="Styl odstavců" value={styleProfile.paragraph_style} />
            <ProfileRow label="Styl nadpisů" value={styleProfile.heading_style} />
            <ProfileRow label="Formálnost" value={styleProfile.formality} />
            <ProfileRow label="Odbornost" value={styleProfile.expertise_level} />
            <ProfileRow label="Úroveň čtení" value={styleProfile.reading_level} />
            <ProfileRow label="Styl otevření" value={styleProfile.opening_style} />
            <ProfileRow label="Styl závěru" value={styleProfile.closing_style} />
            <ProfileRow label="CTA styl" value={styleProfile.cta_style} />
            <ProfileRow label="Rytmus textu" value={styleProfile.text_rhythm} />
          </div>

          {styleProfile.preferred_phrases?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Preferované fráze</p>
              <div className="flex flex-wrap gap-1.5">
                {styleProfile.preferred_phrases.map((p, i) => (
                  <span key={i} className="text-xs bg-brand-900/40 text-brand-300 px-2.5 py-1 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {styleProfile.forbidden_patterns?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Zakázané vzory</p>
              <div className="flex flex-wrap gap-1.5">
                {styleProfile.forbidden_patterns.map((p, i) => (
                  <span key={i} className="text-xs bg-red-950/40 text-red-400 px-2.5 py-1 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {rulesProfile && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Profil pravidel</h3>
            <span className="text-xs text-gray-500">
              Extrahováno: {new Date(rulesProfile.extracted_at).toLocaleDateString('cs-CZ')}
            </span>
          </div>

          <div className="space-y-5">
            <RulesList label="Povinná pravidla (hard rules)" items={rulesProfile.hard_rules} color="red" />
            <RulesList label="Doporučení (soft rules)" items={rulesProfile.soft_rules} color="yellow" />
            <RulesList label="Zakázané prvky" items={rulesProfile.forbidden_elements} color="red" />
            <RulesList label="Povinné prvky" items={rulesProfile.required_elements} color="green" />
            <RulesList label="Formátovací pravidla" items={rulesProfile.formatting_rules} color="blue" />
            <RulesList label="SEO pravidla" items={rulesProfile.seo_rules} color="blue" />
            <RulesList label="Pravidla délky" items={rulesProfile.length_rules} color="gray" />
            <RulesList label="Omezení stylu" items={rulesProfile.style_constraints} color="gray" />
            <RulesList label="Checklist validace" items={rulesProfile.validation_rules} color="gray" />
          </div>
        </section>
      )}
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-800 last:border-0">
      <span className="text-xs text-gray-500 w-36 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-200">{value}</span>
    </div>
  )
}

function RulesList({
  label,
  items,
  color,
}: {
  label: string
  items: string[]
  color: 'red' | 'yellow' | 'green' | 'blue' | 'gray'
}) {
  if (!items?.length) return null

  const dotColor = {
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    gray: 'text-gray-600',
  }[color]

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 mb-2">{label}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-300">
            <span className={`${dotColor} flex-shrink-0 mt-1`}>•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
