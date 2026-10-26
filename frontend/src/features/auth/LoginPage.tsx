import { useState } from 'react'
import type { FormEvent } from 'react'
import { iniciarSesion } from '../../services/auth'
import type { Sesion } from '../../services/auth'

export type UserRole = 'Administrador' | 'Recepción'

export type AuthUser = {
  name: string
  role: UserRole
}

export function convertirSesion(sesion: Sesion): AuthUser {
  if (!sesion.esAdministrador && !sesion.esEmpleado) {
    throw new Error(
      'Tu cuenta no tiene un rol autorizado para utilizar el sistema.',
    )
  }

  return {
    name: sesion.usuario ?? 'Usuario',
    role: sesion.esAdministrador
      ? 'Administrador'
      : 'Recepción',
  }
}

type LoginPageProps = {
  onLogin: (user: AuthUser) => void
}

export default function LoginPage({
  onLogin,
}: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (enviando) {
      return
    }

    setError('')
    setEnviando(true)

    try {
      const sesion = await iniciarSesion(email, password)

      setPassword('')
      onLogin(convertirSesion(sesion))
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0D0D0D] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto size-32 overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900 shadow-2xl">
            <img
              src="/jp-gym-logo.png"
              alt="Logo JP GYM"
              className="h-full w-full object-cover"
            />
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-wide text-white">
            JP GYM
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Sistema administrativo
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-white p-6 shadow-2xl sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D2E]">
            Acceso
          </p>

          <h2 className="mt-2 text-2xl font-bold text-zinc-900">
            Iniciar sesión
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Ingresa el correo y la contraseña de tu cuenta.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6">
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-semibold text-zinc-700"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={256}
              autoComplete="username"
              disabled={enviando}
              placeholder="correo@ejemplo.com"
              className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E] focus:ring-4 focus:ring-red-100"
            />

            <label
              htmlFor="password"
              className="mb-2 mt-5 block text-xs font-semibold text-zinc-700"
            >
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              maxLength={128}
              autoComplete="current-password"
              disabled={enviando}
              className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E] focus:ring-4 focus:ring-red-100"
            />

            <button
              type="submit"
              disabled={enviando}
              className="mt-6 h-12 w-full rounded-xl bg-[#E11D2E] text-sm font-semibold text-white hover:bg-[#C91828] disabled:cursor-wait disabled:opacity-60"
            >
              {enviando ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}