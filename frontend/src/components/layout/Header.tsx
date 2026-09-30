type HeaderProps = {
  menuOpen: boolean
  onOpenMenu: () => void
}

export default function Header({
  menuOpen,
  onOpenMenu,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">

        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú principal"
          aria-expanded={menuOpen}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 lg:hidden"
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

        {/* Nombre */}
        <div>
          <p className="text-sm font-bold text-zinc-900">
            JP GYM
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Panel administrativo
          </p>
        </div>

        {/* Estado */}
        <span className="ml-auto hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 sm:inline-flex">
          En desarrollo
        </span>

        {/* Perfil */}
        <div className="ml-auto flex items-center gap-3 sm:ml-2">
          <div className="hidden text-right md:block">
            <p className="text-xs font-semibold text-zinc-700">
              Administrador
            </p>

            <p className="mt-1 text-[11px] text-zinc-500">
              JP GYM
            </p>
          </div>

          <div className="flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-bold text-zinc-600">
            JP
          </div>
        </div>

      </div>
    </header>
  )
}
