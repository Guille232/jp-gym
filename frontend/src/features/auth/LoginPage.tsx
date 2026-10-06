import { useState } from 'react'
import type { FormEvent } from 'react'

export type UserRole =
  | 'Administrador'
  | 'Recepción'

export type AuthUser = {
  name: string
  role: UserRole
}

type LoginPageProps = {
  onLogin: (user: AuthUser) => void
}

export default function LoginPage({
  onLogin,
}: LoginPageProps) {
  const [username, setUsername] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [error, setError] =
    useState('')

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')

    const normalizedUsername =
      username.trim().toLowerCase()

    if (
      normalizedUsername === 'admin' &&
      password === '1234'
    ) {
      onLogin({
        name: 'Administrador JP GYM',
        role: 'Administrador',
      })

      return
    }

    if (
      normalizedUsername === 'recepcion' &&
      password === '1234'
    ) {
      onLogin({
        name: 'Recepción JP GYM',
        role: 'Recepción',
      })

      return
    }

    setError(
      'Usuario o contraseña incorrectos.',
    )
  }

  function loginAsAdmin() {
    setUsername('admin')
    setPassword('1234')
    setError('')
  }

  function loginAsReception() {
    setUsername('recepcion')
    setPassword('1234')
    setError('')
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
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D2E]">
              Acceso
            </p>

            <h2 className="mt-2 text-2xl font-bold text-zinc-900">
              Iniciar sesión
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6"
          >
            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-700">
                Usuario
              </label>

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value,
                  )
                }
                required
                autoComplete="username"
                placeholder="Ingresa tu usuario"
                className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-[#E11D2E] focus:bg-white focus:ring-4 focus:ring-red-100"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold text-zinc-700">
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-[#E11D2E] focus:bg-white focus:ring-4 focus:ring-red-100"
              />
            </div>

            <button
              type="submit"
              className="mt-6 h-12 w-full rounded-xl bg-[#E11D2E] text-sm font-semibold text-white transition hover:bg-[#C91828]"
            >
              Iniciar sesión
            </button>
          </form>

          <div className="mt-7 border-t border-zinc-100 pt-6">
            <p className="text-center text-xs font-semibold text-zinc-500">
              Accesos de demostración
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={loginAsAdmin}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left transition hover:border-zinc-300 hover:bg-zinc-100"
              >
                <p className="text-xs font-semibold text-zinc-900">
                  Administrador
                </p>

                <p className="mt-1 text-[11px] text-zinc-500">
                  Acceso completo
                </p>
              </button>

              <button
                type="button"
                onClick={loginAsReception}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left transition hover:border-zinc-300 hover:bg-zinc-100"
              >
                <p className="text-xs font-semibold text-zinc-900">
                  Recepción
                </p>

                <p className="mt-1 text-[11px] text-zinc-500">
                  Operaciones diarias
                </p>
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-xs leading-6 text-zinc-500">
              <p>
                Administrador:
                <strong className="ml-1 text-zinc-700">
                  admin
                </strong>
              </p>

              <p>
                Recepción:
                <strong className="ml-1 text-zinc-700">
                  recepcion
                </strong>
              </p>

              <p>
                Contraseña:
                <strong className="ml-1 text-zinc-700">
                  1234
                </strong>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-zinc-600">
          Versión de demostración
        </p>
      </div>
    </main>
  )
}
