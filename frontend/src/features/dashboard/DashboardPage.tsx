import { useState } from 'react'

type ExpiringMember = {
  name: string
  code: string
  phone: string
  expires: string
  status: 'Por vencer' | 'Vencido'
}

const expiringMembers: ExpiringMember[] = [
  {
    name: 'Miguel Batista',
    code: 'JP-A014',
    phone: '849-555-0189',
    expires: '07/10/2026',
    status: 'Por vencer',
  },
  {
    name: 'Ana Rodríguez',
    code: 'JP-A021',
    phone: '809-555-0121',
    expires: '08/10/2026',
    status: 'Por vencer',
  },
  {
    name: 'Luis Martínez',
    code: 'JP-A026',
    phone: '829-555-0175',
    expires: '09/10/2026',
    status: 'Por vencer',
  },
  {
    name: 'Carlos Méndez',
    code: 'JP-A099',
    phone: '809-555-0202',
    expires: '30/09/2026',
    status: 'Vencido',
  },
  {
    name: 'María Santos',
    code: 'JP-A088',
    phone: '849-555-0160',
    expires: '28/09/2026',
    status: 'Vencido',
  },
  {
    name: 'José Ramírez',
    code: 'JP-A074',
    phone: '829-555-0133',
    expires: '25/09/2026',
    status: 'Vencido',
  },
]

const recentMembers = [
  {
    name: 'Jhonatan Rodríguez',
    status: 'Activo',
    expires: '20/10/2026',
  },
  {
    name: 'Yudelkis Hernández',
    status: 'Activo',
    expires: '15/10/2026',
  },
  {
    name: 'Miguel Batista',
    status: 'Por vencer',
    expires: '07/10/2026',
  },
  {
    name: 'Carlos Méndez',
    status: 'Vencido',
    expires: '30/09/2026',
  },
]

export default function DashboardPage() {
  const [visibleList, setVisibleList] = useState<
    'expiring' | 'expired' | null
  >(null)

  const membersToShow =
    visibleList === 'expiring'
      ? expiringMembers.filter(
          (member) => member.status === 'Por vencer',
        )
      : visibleList === 'expired'
        ? expiringMembers.filter(
            (member) => member.status === 'Vencido',
          )
        : []

  return (
    <section>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Resumen general
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Dashboard
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Así va JP GYM actualmente.
        </p>
      </div>

      {/* Miembros */}
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total de miembros"
          value="248"
          detail="+12 este mes"
        />

        <MetricCard
          label="Miembros activos"
          value="221"
          detail="89% del total"
        />

        <MetricCard
          label="Por vencer"
          value="14"
          detail="Próximos 7 días"
          warning
          actionLabel="Ver miembros"
          onAction={() =>
            setVisibleList(
              visibleList === 'expiring'
                ? null
                : 'expiring',
            )
          }
        />

        <MetricCard
          label="Vencidos"
          value="27"
          detail="Requieren renovación"
          danger
          actionLabel="Ver miembros"
          onAction={() =>
            setVisibleList(
              visibleList === 'expired'
                ? null
                : 'expired',
            )
          }
        />
      </div>

      {/* Lista rápida */}
      {visibleList && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-5">
            <div>
              <h2 className="font-semibold text-zinc-900">
                {visibleList === 'expiring'
                  ? 'Miembros por vencer'
                  : 'Miembros vencidos'}
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Vista rápida para dar seguimiento a renovaciones.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setVisibleList(null)}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
            >
              Cerrar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
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
                    Vencimiento
                  </th>

                  <th className="px-5 py-4">
                    Estado
                  </th>

                  <th className="px-5 py-4 text-right">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {membersToShow.map((member) => (
                  <tr
                    key={member.code}
                    className="hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {member.name}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {member.code}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {member.phone}
                    </td>

                    <td className="px-5 py-4">
                      {member.expires}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          member.status === 'Por vencer'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#E11D2E] hover:underline"
                      >
                        Ver ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-3 text-xs text-zinc-500">
            Se muestran datos ficticios para la interfaz.
          </div>
        </div>
      )}

      {/* Finanzas */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <FinanceCard
          label="Ingresos del mes"
          amount={186500}
          variation="+13.0%"
        />

        <FinanceCard
          label="Gastos del mes"
          amount={62800}
          variation="-6.5%"
        />

        <div className="rounded-2xl border border-zinc-800 bg-[#1A1A1A] p-5 text-white shadow-sm">
          <p className="text-xs text-zinc-400">
            Resultado del mes
          </p>

          <p className="mt-3 text-3xl font-bold">
            RD$123,700.00
          </p>

          <p className="mt-3 text-xs font-semibold text-emerald-400">
            +26.5% vs. período anterior
          </p>
        </div>
      </div>

      {/* Segunda fila */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 p-5">
            <h2 className="font-semibold">
              Alertas
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Situaciones que requieren atención.
            </p>
          </div>

          <div className="divide-y divide-zinc-100">
            <Alert
              title="14 mensualidades por vencer"
              description="Vencen durante los próximos 7 días."
              type="warning"
            />

            <Alert
              title="27 miembros vencidos"
              description="Pendientes de renovación."
              type="danger"
            />

            <Alert
              title="18 personas en el gimnasio"
              description="Ocupación estimada actual."
              type="normal"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 p-5">
            <h2 className="font-semibold">
              Miembros recientes
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Estado actual de algunos miembros.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-4">
                    Miembro
                  </th>

                  <th className="px-5 py-4">
                    Estado
                  </th>

                  <th className="px-5 py-4">
                    Vencimiento
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {recentMembers.map((member) => (
                  <tr key={member.name}>
                    <td className="px-5 py-4 font-semibold">
                      {member.name}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={member.status}
                      />
                    </td>

                    <td className="px-5 py-4 text-zinc-500">
                      {member.expires}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-zinc-400">
        Datos ficticios hasta conectar los indicadores reales del backend.
      </p>
    </section>
  )
}

function MetricCard({
  label,
  value,
  detail,
  warning = false,
  danger = false,
  actionLabel,
  onAction,
}: {
  label: string
  value: string
  detail: string
  warning?: boolean
  danger?: boolean
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>

      <p
        className={`mt-3 text-xs font-medium ${
          danger
            ? 'text-red-600'
            : warning
              ? 'text-amber-600'
              : 'text-emerald-700'
        }`}
      >
        {detail}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 text-xs font-semibold text-[#E11D2E] hover:underline"
        >
          {actionLabel} →
        </button>
      )}
    </div>
  )
}

function FinanceCard({
  label,
  amount,
  variation,
}: {
  label: string
  amount: number
  variation: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold">
        RD$
        {amount.toLocaleString('es-DO', {
          minimumFractionDigits: 2,
        })}
      </p>

      <p className="mt-3 text-xs font-semibold text-emerald-700">
        {variation} vs. anterior
      </p>
    </div>
  )
}

function Alert({
  title,
  description,
  type,
}: {
  title: string
  description: string
  type: 'warning' | 'danger' | 'normal'
}) {
  return (
    <div className="flex gap-3 p-5">
      <span
        className={`mt-1 size-2 shrink-0 rounded-full ${
          type === 'danger'
            ? 'bg-red-500'
            : type === 'warning'
              ? 'bg-amber-500'
              : 'bg-emerald-500'
        }`}
      />

      <div>
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: string
}) {
  const classes =
    status === 'Activo'
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
