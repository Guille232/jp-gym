const monthlyIncome = [
  {
    month: 'May',
    amount: 128000,
  },
  {
    month: 'Jun',
    amount: 142000,
  },
  {
    month: 'Jul',
    amount: 151500,
  },
  {
    month: 'Ago',
    amount: 169000,
  },
  {
    month: 'Sep',
    amount: 178400,
  },
  {
    month: 'Oct',
    amount: 186500,
  },
]

const attendanceByDay = [
  {
    day: 'Lun',
    value: 78,
  },
  {
    day: 'Mar',
    value: 64,
  },
  {
    day: 'Mié',
    value: 83,
  },
  {
    day: 'Jue',
    value: 71,
  },
  {
    day: 'Vie',
    value: 92,
  },
  {
    day: 'Sáb',
    value: 58,
  },
]

const paymentMethods = [
  {
    label: 'Efectivo',
    value: 45,
  },
  {
    label: 'Tarjeta',
    value: 32,
  },
  {
    label: 'Transferencia',
    value: 23,
  },
]

export default function AnalyticsPage() {
  const maxIncome = Math.max(
    ...monthlyIncome.map(
      (item) => item.amount,
    ),
  )

  const maxAttendance = Math.max(
    ...attendanceByDay.map(
      (item) => item.value,
    ),
  )

  return (
    <section>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Inteligencia del negocio
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Analíticas
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Visualiza tendencias de ingresos,
          asistencia y cobros.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Ingresos del mes"
          value="RD$186,500"
          detail="+4.5% vs. septiembre"
        />

        <Metric
          label="Renovaciones"
          value="83"
          detail="Este mes"
        />

        <Metric
          label="Asistencias"
          value="446"
          detail="Últimos 7 días"
        />

        <Metric
          label="Retención"
          value="89%"
          detail="+2.1 puntos"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Ingresos */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="font-semibold">
              Evolución de ingresos
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Últimos seis meses.
            </p>
          </div>

          <div className="mt-7 flex h-64 items-end gap-3">
            {monthlyIncome.map(
              (item) => {
                const height =
                  (item.amount /
                    maxIncome) *
                  100

                return (
                  <div
                    key={item.month}
                    className="flex min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <p className="mb-2 hidden text-[10px] font-semibold text-zinc-500 sm:block">
                      RD$
                      {Math.round(
                        item.amount /
                          1000,
                      )}
                      k
                    </p>

                    <div className="flex h-44 w-full items-end rounded-lg bg-zinc-100">
                      <div
                        className="w-full rounded-lg bg-[#E11D2E]"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-[10px] font-semibold text-zinc-500">
                      {item.month}
                    </p>
                  </div>
                )
              },
            )}
          </div>
        </div>

        {/* Asistencia */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">
            Asistencia por día
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Entradas registradas durante
            la semana.
          </p>

          <div className="mt-7 space-y-4">
            {attendanceByDay.map(
              (item) => {
                const width =
                  (item.value /
                    maxAttendance) *
                  100

                return (
                  <div
                    key={item.day}
                    className="grid grid-cols-[40px_1fr_40px] items-center gap-3"
                  >
                    <span className="text-xs font-semibold text-zinc-500">
                      {item.day}
                    </span>

                    <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-zinc-700"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>

                    <strong className="text-right text-xs">
                      {item.value}
                    </strong>
                  </div>
                )
              },
            )}
          </div>
        </div>
      </div>

      {/* Métodos */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">
          Métodos de pago
        </h2>

        <p className="mt-1 text-xs text-zinc-500">
          Distribución estimada de los
          cobros del mes.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {paymentMethods.map(
            (method) => (
              <div
                key={method.label}
                className="rounded-xl bg-zinc-50 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {method.label}
                  </p>

                  <strong className="text-xl">
                    {method.value}%
                  </strong>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-[#E11D2E]"
                    style={{
                      width: `${method.value}%`,
                    }}
                  />
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      <p className="mt-5 text-xs text-zinc-400">
        Datos ficticios hasta conectar los
        reportes reales del backend.
      </p>
    </section>
  )
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-2 text-xs font-medium text-emerald-700">
        {detail}
      </p>
    </div>
  )
}
