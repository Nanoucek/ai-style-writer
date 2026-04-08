import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const nav = [
  { to: '/', label: 'Nahrát podklady', icon: '📁', end: true },
  { to: '/profily', label: 'Profily', icon: '🎨', end: false },
  { to: '/generovat', label: 'Generovat článek', icon: '✍️', end: false },
  { to: '/historie', label: 'Historie', icon: '📋', end: false },
]

export default function Layout() {
  const { styleProfile, rulesProfile } = useApp()

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white tracking-tight">AI Style Writer</h1>
          <p className="text-xs text-gray-400 mt-0.5">Generátor článků podle stylu</p>
        </div>

        {/* Status */}
        <div className="px-4 py-3 border-b border-gray-800 space-y-1.5">
          <StatusBadge label="Stylový profil" active={!!styleProfile} />
          <StatusBadge label="Pravidla" active={!!rulesProfile} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-800">
          <p className="text-xs text-gray-600">
            Powered by GPT-4o
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          active ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'
        }`}
      >
        {active ? 'Aktivní' : 'Chybí'}
      </span>
    </div>
  )
}
