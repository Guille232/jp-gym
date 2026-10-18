import { useMemo, useState } from 'react'

type MembershipStatus =
  | 'Activa'
  | 'Por vencer'
  | 'Vencida'

type Membership = {
  id: number
  member: string
  code: string
  phone: string
  amount: number
  paymentMethod:
    | 'Efectivo'
    | 'Tarjeta'
    | 'Transferencia'
  startDate: string
  endDate: string
  status: MembershipStatus
}

const initialMemberships: Membership[] = [
  {
    id: 1,
    member: 'Jhonatan Rodríguez',
    code: 'JP-A012',
    phone: '809-555-0148',
    amount: 1500,
    paymentMethod: 'Efectivo',
    startDate: '20/09/2026',
    endDate: '19/10/2026',
    status: 'Activa',
  },
  {
    id: 2,
    member: 'Yudelkis Hernández',
    code: 'JP-A013',
    phone: '829-555-0112',
    amount: 1500,
    paymentMethod: 'Tarjeta',
    startDate: '15/09/2026',
    endDate: '14/10/2026',
    status: 'Activa',
  },
  {
    id: 3,
    member: 'Miguel Batista',
    code: 'JP-A014',
    phone: '849-555-0189',
    amount: 1500,
    paymentMethod: 'Transferencia',
    startDate: '08/09/2026',
    endDate: '07/10/2026',
    status: 'Por vencer',
  },
  {
    id: 4,
    member: 'Carlos Méndez',
    code: 'JP-A099',
    phone: '809-555-0202',
    amount: 1500,
    paymentMethod: 'Efectivo',
    startDate: '01/09/2026',
    endDate: '30/09/2026',
    status: 'Vencida',
  },
  {
    id: 5,
    member: 'María Santos',
    code: 'JP-A088',
    phone: '849-555-0160',
    amount: 1500,
    paymentMethod: 'Tarjeta',
    startDate: '29/08/2026',
    endDate: '28/09/2026',
    status: 'Vencida',
  },
]

export default function MembershipsPage() {
  const [memberships] =
    useState<Membership[]>(
      initialMemberships,
    )

  const [search, setSearch] =
    useState('')

  const [status, setStatus] =
    useState<MembershipStatus | ''>('')

  const filtered = useMemo(() => {
    const term =
      search.trim().toLowerCase()

    return memberships.filter(
      (membership) => {
        const matchesSearch =
          !term ||
          membership.member
            .toLowerCase()
            .includes(term) ||
          membership.code
            .toLowerCase()
            .includes(term) ||
          membership.phone
            .toLowerCase()
            .includes(term)

        const matchesStatus =
          !status ||
          membership.status === status

        return (
          matchesSearch &&
          matchesStatus
        )
      },
    )
  }, [memberships, search, status])

  const active =
    memberships.filter(
      (item) =>
        item.status === 'Activa',
    ).length

  const expiring =
    memberships.filter(
      (item) =>
        item.status === 'Por vencer',
    ).length

  const expired =
    memberships.filter(
      (item) =>
        item.status === 'Vencida',
    ).length

  return (
    <section>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Control de mensualidades
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Membresías
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Consulta la vigencia y los pagos
          de mensualidad de los miembros.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Activas"
          value={active}
          type="active"
        />

        <SummaryCard
          label="Por vencer"
          value={expiring}
          type="warning"
        />

        <SummaryCard
          label="Vencidas"
          value={expired}
          type="danger"
        />
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
              placeholder="Nombre, código o teléfono..."
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-600">
              Estado
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target
                    .value as
                    | MembershipStatus
                    | '',
                )
              }
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
            >
              <option value="">
                Todos
              </option>

              <option value="Activa">
                Activas
              </option>

              <option value="Por vencer">
                Por vencer
              </option>

              <option value="Vencida">
                Vencidas
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-4">
                  Miembro
                </th>

                <th className="px-5 py-4">
                  Código
                </th>

                <th className="px-5 py-4">
                  Teléfono
                </th>

                <th className="px-5 py-4">
                  Período
                </th>

                <th className="px-5 py-4">
                  Método
                </th>

                <th className="px-5 py-4">
                  Monto
                </th>

                <th className="px-5 py-4">
                  Estado
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {filtered.map(
                (membership) => (
                  <tr
                    key={membership.id}
                    className="hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {membership.member}
                    </td>

                    <td className="px-5 py-4">
                      {membership.code}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {membership.phone}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {membership.startDate}
                      {' → '}
                      {membership.endDate}
                    </td>

                    <td className="px-5 py-4">
                      {membership.paymentMethod}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      RD$
                      {membership.amount.toLocaleString(
                        'es-DO',
                        {
                          minimumFractionDigits: 2,
                        },
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={
                          membership.status
                        }
                      />
                    </td>
                  </tr>
                ),
              )}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-zinc-500"
                  >
                    No se encontraron
                    mensualidades.
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

function SummaryCard({
  label,
  value,
  type,
}: {
  label: string
  value: number
  type:
    | 'active'
    | 'warning'
    | 'danger'
}) {
  const classes =
    type === 'active'
      ? 'text-emerald-700'
      : type === 'warning'
        ? 'text-amber-700'
        : 'text-red-700'

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${classes}`}
      >
        {value}
      </p>
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: MembershipStatus
}) {
  const classes =
    status === 'Activa'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'Por vencer'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-red-50 text-red-700'

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {status}
    </span>
  )
}
