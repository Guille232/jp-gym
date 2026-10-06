import { useMemo, useState } from 'react'

type PaymentMethod =
  | 'Efectivo'
  | 'Tarjeta'
  | 'Transferencia'

type Payment = {
  id: number
  member: string
  code: string
  amount: number
  method: PaymentMethod
  paymentDate: string
  period: string
}

const payments: Payment[] = [
  {
    id: 1,
    member: 'Jhonatan Rodríguez',
    code: 'JP-A012',
    amount: 1500,
    method: 'Efectivo',
    paymentDate: '05/10/2026 08:20 AM',
    period: '05 oct - 04 nov 2026',
  },
  {
    id: 2,
    member: 'Yudelkis Hernández',
    code: 'JP-A013',
    amount: 1500,
    method: 'Tarjeta',
    paymentDate: '05/10/2026 09:32 AM',
    period: '05 oct - 04 nov 2026',
  },
  {
    id: 3,
    member: 'Miguel Batista',
    code: 'JP-A014',
    amount: 1400,
    method: 'Transferencia',
    paymentDate: '04/10/2026 05:15 PM',
    period: '08 oct - 07 nov 2026',
  },
  {
    id: 4,
    member: 'Paola Alcántara',
    code: 'JP-A015',
    amount: 1500,
    method: 'Efectivo',
    paymentDate: '03/10/2026 06:44 PM',
    period: '03 oct - 02 nov 2026',
  },
]

export default function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [method, setMethod] = useState<
    PaymentMethod | ''
  >('')

  const filtered = useMemo(() => {
    const term =
      search.trim().toLowerCase()

    return payments.filter((payment) => {
      const matchesSearch =
        !term ||
        payment.member
          .toLowerCase()
          .includes(term) ||
        payment.code
          .toLowerCase()
          .includes(term)

      const matchesMethod =
        !method ||
        payment.method === method

      return (
        matchesSearch &&
        matchesMethod
      )
    })
  }, [search, method])

  const total = filtered.reduce(
    (sum, payment) =>
      sum + payment.amount,
    0,
  )

  return (
    <section>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Finanzas
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Pagos
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Consulta los pagos registrados
          de las mensualidades.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-zinc-500">
            Pagos visibles
          </p>

          <p className="mt-2 text-3xl font-bold">
            {filtered.length}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-zinc-500">
            Total mostrado
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
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-4 border-b border-zinc-100 p-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-600">
              Buscar
            </label>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Nombre o código..."
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-600">
              Método
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
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
            >
              <option value="">
                Todos
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-4">
                  Miembro
                </th>

                <th className="px-5 py-4">
                  Código
                </th>

                <th className="px-5 py-4">
                  Período
                </th>

                <th className="px-5 py-4">
                  Método
                </th>

                <th className="px-5 py-4">
                  Fecha pago
                </th>

                <th className="px-5 py-4 text-right">
                  Monto
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {filtered.map(
                (payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {payment.member}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {payment.code}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {payment.period}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium">
                        {payment.method}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {payment.paymentDate}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold">
                      RD$
                      {payment.amount.toLocaleString(
                        'es-DO',
                        {
                          minimumFractionDigits: 2,
                        },
                      )}
                    </td>
                  </tr>
                ),
              )}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-zinc-500"
                  >
                    No se encontraron pagos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-zinc-100 px-5 py-4 text-xs text-zinc-500">
          Datos ficticios para la interfaz.
        </div>
      </div>
    </section>
  )
}
