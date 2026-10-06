import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

type AccessResult = {
  found: boolean
  allowed: boolean
  name?: string
  code?: string
  reason: string
  validUntil?: string
}

const demoAccess: Record<string, AccessResult> = {
  'JP-A012': {
    found: true,
    allowed: true,
    name: 'Jhonatan Rodríguez',
    code: 'JP-A012',
    reason: 'Mensualidad vigente.',
    validUntil: '20/10/2026',
  },

  'JP-A013': {
    found: true,
    allowed: true,
    name: 'Yudelkis Hernández',
    code: 'JP-A013',
    reason: 'Mensualidad vigente.',
    validUntil: '15/10/2026',
  },

  'JP-A014': {
    found: true,
    allowed: true,
    name: 'Miguel Batista',
    code: 'JP-A014',
    reason: 'Mensualidad próxima a vencer.',
    validUntil: '07/10/2026',
  },

  'JP-A099': {
    found: true,
    allowed: false,
    name: 'Carlos Méndez',
    code: 'JP-A099',
    reason: 'No tiene una mensualidad vigente.',
  },
}

export default function CheckInPage() {
  const [code, setCode] = useState('')
  const [result, setResult] =
    useState<AccessResult | null>(null)

  const [registeredAt, setRegisteredAt] =
    useState('')

  const inputRef =
    useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function findMember() {
    const normalized =
      code.trim().toUpperCase()

    if (!normalized) {
      setResult({
        found: false,
        allowed: false,
        reason:
          'Introduce o escanea un código.',
      })

      setRegisteredAt('')

      return null
    }

    const member =
      demoAccess[normalized]

    if (!member) {
      setResult({
        found: false,
        allowed: false,
        reason:
          'No se encontró un miembro con este código.',
      })

      setRegisteredAt('')

      return null
    }

    setResult(member)
    setRegisteredAt('')

    return member
  }

  function handleConsult() {
    findMember()
  }

  function handleRegister(
    event?: FormEvent<HTMLFormElement>,
  ) {
    event?.preventDefault()

    const member = findMember()

    if (!member || !member.allowed) {
      return
    }

    setRegisteredAt(
      new Intl.DateTimeFormat(
        'es-DO',
        {
          dateStyle: 'short',
          timeStyle: 'medium',
        },
      ).format(new Date()),
    )
  }

  function handleClear() {
    setCode('')
    setResult(null)
    setRegisteredAt('')

    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  return (
    <section>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Recepción
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Check-in
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
          Escanea el código del miembro
          o introdúcelo manualmente para
          comprobar su acceso.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold">
            Consultar miembro
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            El campo queda preparado para
            recibir la lectura del escáner.
          </p>

          <form
            onSubmit={handleRegister}
            className="mt-6"
          >
            <label
              htmlFor="barcode"
              className="mb-2 block text-xs font-semibold text-zinc-700"
            >
              Código de barras
            </label>

            <input
              ref={inputRef}
              id="barcode"
              type="text"
              value={code}
              onChange={(event) => {
                setCode(
                  event.target.value.toUpperCase(),
                )

                setResult(null)
                setRegisteredAt('')
              }}
              placeholder="Ej. JP-A012"
              autoComplete="off"
              className="h-14 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-lg font-semibold uppercase tracking-wider outline-none focus:border-[#E11D2E] focus:bg-white focus:ring-4 focus:ring-red-100"
            />

            <p className="mt-2 text-[11px] text-zinc-400">
              Si el lector envía Enter,
              se intentará registrar la entrada.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleConsult}
                className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold hover:bg-zinc-50"
              >
                Consultar acceso
              </button>

              <button
                type="submit"
                className="h-11 rounded-xl bg-[#E11D2E] px-4 text-sm font-semibold text-white hover:bg-[#C91828]"
              >
                Registrar entrada
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="h-11 rounded-xl border border-zinc-200 bg-zinc-100 px-4 text-sm font-semibold text-zinc-600 hover:bg-zinc-200"
              >
                Limpiar
              </button>
            </div>
          </form>

          <div className="mt-6 rounded-xl bg-zinc-50 p-4 text-xs leading-5 text-zinc-500">
            Prueba con{' '}
            <strong>JP-A012</strong>{' '}
            para acceso permitido y{' '}
            <strong>JP-A099</strong>{' '}
            para acceso denegado.
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold">
            Resultado
          </h2>

          {!result && (
            <div className="mt-6 flex min-h-64 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
              <div>
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-zinc-200 text-xl">
                  ↓
                </div>

                <p className="mt-4 text-sm font-medium">
                  Esperando una lectura
                </p>

                <p className="mt-2 text-xs text-zinc-500">
                  Escanea o introduce un código.
                </p>
              </div>
            </div>
          )}

          {result && (
            <div
              className={`mt-6 rounded-xl border p-5 ${
                result.allowed
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                    result.allowed
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {result.allowed
                    ? '✓'
                    : '✕'}
                </div>

                <div>
                  <p
                    className={`font-bold ${
                      result.allowed
                        ? 'text-emerald-800'
                        : 'text-red-800'
                    }`}
                  >
                    {result.allowed
                      ? 'Acceso permitido'
                      : 'Acceso denegado'}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    {result.reason}
                  </p>
                </div>
              </div>

              {result.found && (
                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-black/5 pt-5 sm:grid-cols-2">
                  <Info
                    label="Miembro"
                    value={
                      result.name ?? ''
                    }
                  />

                  <Info
                    label="Código"
                    value={
                      result.code ?? ''
                    }
                  />

                  {result.validUntil && (
                    <Info
                      label="Válido hasta"
                      value={
                        result.validUntil
                      }
                    />
                  )}
                </div>
              )}

              {registeredAt && (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-white p-4">
                  <p className="text-sm font-semibold text-emerald-700">
                    Entrada registrada
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {registeredAt}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-zinc-800">
        {value}
      </p>
    </div>
  )
}
