import AppLayout from './components/layout/AppLayout'

function App() {
  return (
    <AppLayout>
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Comunidad JP GYM
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Miembros
          </h1>

          <span className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-500">
            Vista inicial
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Administra la información de los miembros de JP GYM desde un
          solo lugar.
        </p>

        <div className="mt-7 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-zinc-800">
              Registro y consulta de miembros
            </h2>
          </div>

          <div className="px-6 py-12 text-center sm:py-16">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-lg font-extrabold text-[#E11D2E]">
              JP
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              Módulo de miembros
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              En el próximo paso agregaremos el listado de miembros,
              el buscador y el formulario para registrar nuevos socios.
            </p>

            <p className="mt-6 text-xs text-zinc-400">
              Esta pantalla todavía no guarda ni consulta información.
            </p>
          </div>
        </div>
      </section>
    </AppLayout>
  )
}

export default App
