import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type PaymentMethod =
  | 'Efectivo'
  | 'Tarjeta'
  | 'Transferencia'

type DailyEntry = {
  id: number
  amount: number
  method: PaymentMethod
  observation: string
  date: string
  time: string
}

const initialEntries: DailyEntry[] = [
  {
    id: 1,
    amount: 150,
    method: 'Efectivo',
    observation: '',
    date: '2026-10-05',
    time: '08:35 AM',
  },
  {
    id: 2,
    amount: 150,
    method: 'Transferencia',
    observation: 'Visitante',
    date: '2026-10-05',
    time: '09:18 AM',
  },
  {
    id: 3,
    amount: 150,
    method: 'Tarjeta',
    observation: '',
    date: '2026-10-05',
    time: '10:03 AM',
  },
]

export default function DailyEntriesPage() {
  const [entries, setEntries] =
    useState<DailyEntry[]>(
      initialEntries,
    )

  const [amount, setAmount] =
    useState('150')

  const [method, setMethod] =
    useState<PaymentMethod | ''>('')

  const [
    observation,
    setObservation,
  ] = useState('')

  const [date, setDate] =
    useState('2026-10-05')

  const [message, setMessage] =
    useState('')

  const filtered = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.date === date,
      ),
    [entries, date],
  )

  const total = filtered.reduce(
    (sum, entry) =>
      sum + entry.amount,
    0,
  )

  const cash = filtered
    .filter(
      (entry) =>
        entry.method === 'Efectivo',
    )
    .reduce(
      (sum, entry) =>
        sum + entry.amount,
      0,
    )

  const card = filtered
    .filter(
      (entry) =>
        entry.method === 'Tarjeta',
    )
    .reduce(
      (sum, entry) =>
        sum + entry.amount,
      0,
    )

  const transfer = filtered
    .filter(
      (entry) =>
        entry.method ===
        'Transferencia',
    )
    .reduce(
      (sum, entry) =>
        sum + entry.amount,
      0,
    )

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const numericAmount =
      Number(amount)

    if (
      !Number.isFinite(
        numericAmount,
      ) ||
      numericAmount <= 0 ||
      !method
    ) {
      return
    }

    const now = new Date()

    const newEntry: DailyEntry = {
      id: Date.now(),
      amount: numericAmount,
      method,
      observation:
        observation.trim(),
      date,
      time:
        new Intl.DateTimeFormat(
          'es-DO',
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        ).format(now),
    }

    setEntries((current) => [
      newEntry,
      ...current,
    ])

    setMethod('')
    setObservation('')

    setMessage(
      'Entrada diaria registrada correctamente.',
    )
  }

  return (
    <section>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Recepción
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Entradas diarias
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
          Registra personas que pagan
          únicamente por utilizar el
          gimnasio durante un día.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">

        {/* Registro */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">
            Registrar cobro
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            No requiere crear un miembro.
          </p>

          {message && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-5"
          >
            <label className="mb-2 block text-xs font-semibold text-zinc-700">
              Monto *
            </label>

            <div className="relative">
              <span className="absolute left-4 top-3 text-sm font-semibold text-zinc-500">
                RD$
              </span>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value,
                  )
                }
                required
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-sm font-semibold outline-none focus:border-[#E11D2E]"
              />
            </div>

            <label className="mb-2 mt-5 block text-xs font-semibold text-zinc-700">
              Método de pago *
            </label>

            <select
              value={method}
              onChange={(event) =>
                setMethod(
                  event.target
                    .value as
                    | PaymentMethod
                    | '',
                )
              }
              required
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
            >
              <option value="">
                Selecciona
              </option>

              <option value="Efectivo">
                Efectivo
              </option>

              <option value="Tarjeta">
                Tarjeta
              </option>

              <option value="Transferencia">
                Transferencia
              </option>
            </select>

            <label className="mb-2 mt-5 block text-xs font-semibold text-zinc-700">
              Observación
            </label>

            <textarea
              value={observation}
              onChange={(event) =>
                setObservation(
                  event.target.value,
                )
              }
              maxLength={250}
              rows={3}
              placeholder="Opcional"
              className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-[#E11D2E]"
            />

            <button
              type="submit"
              className="mt-5 h-11 w-full rounded-xl bg-[#E11D2E] text-sm font-semibold text-white hover:bg-[#C91828]"
            >
              Confirmar cobro
            </button>
          </form>
        </div>

        {/* Resumen */}
        <div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Summary
              label="Entradas"
              value={String(
                filtered.length,
              )}
            />

            <Summary
              label="Efectivo"
              value={`RD$${cash.toLocaleString(
                'es-DO',
              )}`}
            />

            <Summary
              label="Tarjeta"
              value={`RD$${card.toLocaleString(
                'es-DO',
              )}`}
            />

            <Summary
              label="Transferencia"
              value={`RD$${transfer.toLocaleString(
                'es-DO',
              )}`}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-200 bg-[#1A1A1A] p-5 text-white shadow-sm">
            <p className="text-xs text-zinc-400">
              Total entradas del día
            </p>

            <p className="mt-2 text-3xl font-bold">
              RD$
              {total.toLocaleString(
                'es-DO',
                {
                  minimumFractionDigits: 2,
                },
              )}
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 p-5">
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Fecha
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value,
                  )
                }
                className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-4">
                      Hora
                    </th>

                    <th className="px-5 py-4">
                      Método
                    </th>

                    <th className="px-5 py-4">
                      Observación
                    </th>

                    <th className="px-5 py-4 text-right">
                      Monto
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {filtered.map(
                    (entry) => (
                      <tr
                        key={
                          entry.id
                        }
                      >
                        <td className="px-5 py-4">
                          {
                            entry.time
                          }
                        </td>

                        <td className="px-5 py-4">
                          {
                            entry.method
                          }
                        </td>

                        <td className="px-5 py-4 text-zinc-500">
                          {entry.observation ||
                            '—'}
                        </td>

                        <td className="px-5 py-4 text-right font-semibold">
                          RD$
                          {entry.amount.toLocaleString(
                            'es-DO',
                            {
                              minimumFractionDigits: 2,
                            },
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Summary({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] text-zinc-500">
        {label}
      </p>

      <p className="mt-2 font-bold">
        {value}
      </p>
    </div>
  )
}
