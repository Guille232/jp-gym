type SidebarProps = {
  onClose?: () => void
}

const menuGroups = [
  {
    title: 'Principal',
    items: ['Dashboard', 'Check-in'],
  },
  {
    title: 'Membresía',
    items: ['Miembros', 'Membresías', 'Asistencia', 'Pagos'],
  },
  {
    title: 'Negocio',
    items: [
      'Gastos',
      'Empleados',
      'Clases',
      'Entrenadores',
      'Analíticas',
    ],
  },
]

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0D0D0D] text-white">
      {/* Logo */}
      <div className="flex h-24 shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-zinc-400 bg-zinc-800">
          <span className="text-lg font-extrabold text-zinc-200">
            JP
          </span>
        </div>

        <div>
          <p className="text-lg font-extrabold tracking-wider">
            JP GYM
          </p>

          <p className="mt-1 text-[10px] tracking-widest text-zinc-400">
            ADMINISTRACIÓN
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="ml-auto flex size-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {menuGroups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              {group.title}
            </h2>

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = item === 'Miembros'

                return (
                  <button
                    key={item}
                    type="button"
                    disabled={!isActive}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                      isActive
                        ? 'border border-red-500/20 bg-[#E11D2E]/15 font-medium text-red-300'
                        : 'cursor-not-allowed text-zinc-500'
                    }`}
                  >
                    <span
                      className={`size-2 rounded-full ${
                        isActive
                          ? 'bg-[#E11D2E]'
                          : 'bg-zinc-700'
                      }`}
                    />

                    <span>{item}</span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </nav>

      {/* Parte inferior */}
      <div className="shrink-0 border-t border-white/10 p-5">
        <p className="text-xs font-medium text-zinc-300">
          JP GYM · Sede principal
        </p>

        <p className="mt-2 text-[11px] leading-5 text-zinc-500">
          Sistema administrativo en desarrollo.
        </p>
      </div>
    </div>
  )
}
