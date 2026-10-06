import type { UserRole } from '../../features/auth/LoginPage'

export type AppPage =
  | 'dashboard'
  | 'members'
  | 'memberships'
  | 'checkin'
  | 'attendance'
  | 'payments'
  | 'dailyEntries'
  | 'expenses'
  | 'employees'
  | 'trainers'
  | 'classes'
  | 'analytics'

type SidebarProps = {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  role: UserRole
  onClose?: () => void
}

type MenuItem = {
  label: string
  id: AppPage
  adminOnly?: boolean
}

type MenuGroup = {
  title: string
  adminOnly?: boolean
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    title: 'Principal',
    items: [
      {
        label: 'Dashboard',
        id: 'dashboard',
      },
      {
        label: 'Check-in',
        id: 'checkin',
      },
      {
        label: 'Entradas diarias',
        id: 'dailyEntries',
      },
    ],
  },

  {
    title: 'Membresía',
    items: [
      {
        label: 'Miembros',
        id: 'members',
      },
      {
        label: 'Membresías',
        id: 'memberships',
      },
      {
        label: 'Asistencia',
        id: 'attendance',
      },
      {
        label: 'Pagos',
        id: 'payments',
      },
    ],
  },

  {
    title: 'Negocio',
    adminOnly: true,
    items: [
      {
        label: 'Gastos',
        id: 'expenses',
        adminOnly: true,
      },
      {
        label: 'Empleados',
        id: 'employees',
        adminOnly: true,
      },
      {
        label: 'Clases',
        id: 'classes',
        adminOnly: true,
      },
      {
        label: 'Entrenadores',
        id: 'trainers',
        adminOnly: true,
      },
      {
        label: 'Analíticas',
        id: 'analytics',
        adminOnly: true,
      },
    ],
  },
]

export default function Sidebar({
  activePage,
  onNavigate,
  role,
  onClose,
}: SidebarProps) {
  const isAdmin =
    role === 'Administrador'

  function navigate(page: AppPage) {
    onNavigate(page)
    onClose?.()
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0D0D0D] text-white">
      <div className="flex h-28 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <div className="size-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          <img
            src="/jp-gym-logo.png"
            alt="JP GYM"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0">
          <p className="text-lg font-extrabold tracking-wider text-white">
            JP GYM
          </p>

          <p className="mt-1 text-[9px] font-medium uppercase tracking-widest text-zinc-500">
            Administración
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      <nav className="min-h-0 flex-1 space-y-7 overflow-y-auto px-3 py-6">
        {menuGroups.map((group) => {
          if (
            group.adminOnly &&
            !isAdmin
          ) {
            return null
          }

          const visibleItems =
            group.items.filter(
              (item) =>
                !item.adminOnly ||
                isAdmin,
            )

          if (
            visibleItems.length === 0
          ) {
            return null
          }

          return (
            <section key={group.title}>
              <h2 className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                {group.title}
              </h2>

              <div className="space-y-1">
                {visibleItems.map(
                  (item) => {
                    const active =
                      item.id === activePage

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() =>
                          navigate(item.id)
                        }
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                          active
                            ? 'bg-[#E11D2E] font-semibold text-white shadow-lg shadow-red-950/20'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span
                          className={`size-2 shrink-0 rounded-full ${
                            active
                              ? 'bg-white'
                              : 'bg-zinc-700 group-hover:bg-zinc-500'
                          }`}
                        />

                        <span className="truncate">
                          {item.label}
                        </span>
                      </button>
                    )
                  },
                )}
              </div>
            </section>
          )
        })}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
          <div className="flex items-center gap-3">
            <span
              className={`size-2 rounded-full ${
                role === 'Administrador'
                  ? 'bg-[#E11D2E]'
                  : 'bg-emerald-500'
              }`}
            />

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
                Sesión actual
              </p>

              <p className="mt-1 text-xs font-semibold text-zinc-300">
                {role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
