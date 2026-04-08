import { createContext, useContext, useState, type ReactNode } from 'react'
import type { StyleProfile, RulesProfile, ArticleRecord } from '../lib/types'

interface AppContextType {
  styleProfile: StyleProfile | null
  rulesProfile: RulesProfile | null
  articles: ArticleRecord[]
  setStyleProfile: (p: StyleProfile) => void
  setRulesProfile: (p: RulesProfile) => void
  addArticle: (a: ArticleRecord) => void
  updateArticle: (id: string, updates: Partial<ArticleRecord>) => void
  clearProfiles: () => void
}

const AppContext = createContext<AppContextType | null>(null)

function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function saveJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [styleProfile, setStyleProfileState] = useState<StyleProfile | null>(
    () => loadJson<StyleProfile>('asw_style'),
  )
  const [rulesProfile, setRulesProfileState] = useState<RulesProfile | null>(
    () => loadJson<RulesProfile>('asw_rules'),
  )
  const [articles, setArticles] = useState<ArticleRecord[]>(
    () => loadJson<ArticleRecord[]>('asw_articles') ?? [],
  )

  const setStyleProfile = (p: StyleProfile) => {
    setStyleProfileState(p)
    saveJson('asw_style', p)
  }

  const setRulesProfile = (p: RulesProfile) => {
    setRulesProfileState(p)
    saveJson('asw_rules', p)
  }

  const addArticle = (a: ArticleRecord) => {
    setArticles((prev) => {
      const updated = [a, ...prev].slice(0, 50) // max 50 článků v historii
      saveJson('asw_articles', updated)
      return updated
    })
  }

  const updateArticle = (id: string, updates: Partial<ArticleRecord>) => {
    setArticles((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      saveJson('asw_articles', updated)
      return updated
    })
  }

  const clearProfiles = () => {
    setStyleProfileState(null)
    setRulesProfileState(null)
    localStorage.removeItem('asw_style')
    localStorage.removeItem('asw_rules')
  }

  return (
    <AppContext.Provider
      value={{
        styleProfile,
        rulesProfile,
        articles,
        setStyleProfile,
        setRulesProfile,
        addArticle,
        updateArticle,
        clearProfiles,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp musí být použit uvnitř AppProvider')
  return ctx
}
