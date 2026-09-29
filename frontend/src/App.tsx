import './index.css'

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F5F5] p-6 font-sans text-zinc-900 antialiased">
      <section className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E11D2E]">
          Sistema administrativo
        </p>

        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
          JP GYM
        </h1>

        <h2 className="mt-6 text-lg font-semibold">
          Base del frontend
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Esta pantalla nos permite comprobar los estilos antes de
          construir el menú y el registro de miembros.
        </p>

        <div className="mt-6 rounded-xl bg-[#E11D2E] px-4 py-3 text-center text-sm font-semibold text-white">
          React + TypeScript + Tailwind CSS
        </div>

        <p className="mt-4 text-center text-xs text-zinc-500">
          Pantalla de prueba · Sin conexión al backend
        </p>
      </section>
    </main>
  )
}

export default App
