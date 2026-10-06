import { useState } from 'react'
import type { ReactNode } from 'react'

import Header from './Header'
import Sidebar from './Sidebar'

import type { AppPage } from './Sidebar'

import type {
  AuthUser,
} from '../../features/auth/LoginPage'

type AppLayoutProps = {
  children: ReactNode
  activePage: AppPage
  onNavigate: (
    page: AppPage,
  ) => void
  user: AuthUser
  onLogout: () => void
}

export default function AppLayout({
  children,
  activePage,
  onNavigate,
  user,
  onLogout,
}: AppLayoutProps) {
  const [menuOpen, setMenuOpen] =
    useState(false)

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-zinc-900">
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar
          activePage={activePage}
          onNavigate={onNavigate}
          role={user.role}
        />
      </aside>

      {/* Overlay móvil */}
      {menuOpen && (
        <button
          type="button"
          onClick={() =>
            setMenuOpen(false)
          }
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* Sidebar móvil */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl transition-transform duration-300 lg:hidden ${
          menuOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        <Sidebar
          activePage={activePage}
          onNavigate={onNavigate}
          role={user.role}
          onClose={() =>
            setMenuOpen(false)
          }
        />
      </aside>

      {/* Área principal */}
      <div className="min-h-screen lg:pl-64">
        <Header
          menuOpen={menuOpen}
          onOpenMenu={() =>
            setMenuOpen(true)
          }
          userName={user.name}
          role={user.role}
          activePage={activePage}
          onLogout={onLogout}
        />

        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
