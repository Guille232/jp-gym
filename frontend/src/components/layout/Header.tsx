import type { UserRole } from '../../features/auth/LoginPage'
import type { AppPage } from './Sidebar'

type HeaderProps = {
  menuOpen: boolean
  onOpenMenu: () => void
  userName: string
  role: UserRole
  activePage: AppPage
  onLogout: () => void
}

const pageTitles: Record<
  AppPage,
  {
    title: string
    section: string
  }
> = {
  dashboard: {
    title: 'Dashboard',
    section: 'Resumen general',
  },
  checkin: {
    title: 'Check-in',
    section: 'Recepción',
  },
  dailyEntries: {
    title: 'Entradas diarias',
    section: 'Recepción',
  },
  members: {
    title: 'Miembros',
    section: 'Membresía',
  },
  memberships: {
    title: 'Membresías',
    section: 'Membresía',
  },
  attendance: {
    title: 'Asistencia',
    section: 'Membresía',
  },
  payments: {
    title: 'Pagos',
    section: 'Membresía',
  },
  expenses: {
    title: 'Gastos',
    section: 'Negocio',
  },
  employees: {
    title: 'Empleados',
    section: 'Personal',
  },
  classes: {
    title: 'Clases',
    section: 'Actividades',
  },
  trainers: {
    title: 'Entrenadores',
    section: 'Personal',
  },
  analytics: {
    title: 'Analíticas',
    section: 'Negocio',
  },
}

export default function Header({
  menuOpen,
  onOpenMenu,
  userName,
  role,
  activePage,
  onLogout,
}: HeaderProps) {
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase(),
    )
    .join('')

  const currentPage =
    pageTitles[activePage]

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú principal"
          aria-expanded={menuOpen}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 lg:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-5"
          >
            <path d="M4 6h16 M4 12h16 M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <p className="hidden text-[10px] font-semibold uppercase tracking-widest text-zinc-400 sm:block">
            {currentPage.section}
          </p>

          <p className="truncate text-sm font-bold text-zinc-900 sm:mt-1">
            {currentPage.title}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 lg:block">
            Sistema activo
          </div>

          <div className="hidden text-right md:block">
            <p className="max-w-40 truncate text-xs font-semibold text-zinc-800">
              {userName}
            </p>

            <p className="mt-1 text-[11px] text-zinc-500">
              {role}
            </p>
          </div>

          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-bold text-zinc-700">
            {initials}
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="hidden h-9 rounded-xl border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:block"
          >
            Salir
          </button>

          <button
            type="button"
            onClick={onLogout}
            aria-label="Cerrar sesión"
            className="flex size-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-red-50 hover:text-red-600 sm:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
