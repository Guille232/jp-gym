import { useState } from 'react'

const membershipIncome = 32500
const dailyEntryIncome = 4200

const cashIncome = 18500
const cardIncome = 10200
const transferIncome = 8000

const expenses = 3500

export default function DailyClosePage() {
  const [countedCash, setCountedCash] =
    useState('')

  const [closed, setClosed] =
    useState(false)

  const [showConfirmation, setShowConfirmation] =
    useState(false)

  const totalIncome =
    membershipIncome +
    dailyEntryIncome

  const netResult =
    totalIncome - expenses

  const numericCountedCash =
    Number(countedCash)

  const validCountedCash =
    countedCash !== '' &&
    Number.isFinite(
      numericCountedCash,
    ) &&
    numericCountedCash >= 0

  const difference =
    validCountedCash
      ? numericCountedCash -
        cashIncome
      : 0

  function handleCloseDay() {
    if (!validCountedCash) {
      return
    }

    setShowConfirmation(false)
    setClosed(true)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Caja
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Corte diario
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Revisa los ingresos, gastos y efectivo antes de cerrar el día.
          </p>
        </div>

        <div>
          {closed ? (
            <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Día cerrado
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
              Caja abierta
            </span>
          )}
        </div>
      </div>

      {/* Resumen principal */}
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Membresías"
          amount={membershipIncome}
        />

        <MetricCard
          label="Entradas diarias"
          amount={dailyEntryIncome}
        />

        <MetricCard
          label="Ingresos totales"
          amount={totalIncome}
          important
        />

        <MetricCard
          label="Gastos"
          amount={expenses}
          danger
        />
      </div>

      {/* Formas de pago */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-5">
          <h2 className="font-semibold text-zinc-900">
            Ingresos por método de pago
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Distribución de los cobros registrados durante el día.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px bg-zinc-100 sm:grid-cols-3">
          <PaymentMethodCard
            label="Efectivo"
            amount={cashIncome}
          />

          <PaymentMethodCard
            label="Tarjeta"
            amount={cardIncome}
          />

          <PaymentMethodCard
            label="Transferencia"
            amount={transferIncome}
          />
        </div>
      </div>

      {/* Caja */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D2E]">
              Arqueo
            </p>

            <h2 className="mt-2 text-xl font-bold text-zinc-900">
              Verificación de efectivo
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Cuenta el efectivo físico y compáralo con lo registrado por el sistema.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs text-zinc-500">
                Efectivo registrado
              </p>

              <p className="mt-2 text-2xl font-bold text-zinc-900">
                {formatCurrency(
                  cashIncome,
                )}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-700">
                Efectivo contado *
              </label>

              <div className="relative">
                <span className="absolute left-4 top-3 text-sm font-semibold text-zinc-500">
                  RD$
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={countedCash}
                  disabled={closed}
                  onChange={(event) =>
                    setCountedCash(
                      event.target.value,
                    )
                  }
                  placeholder="0.00"
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-sm font-semibold outline-none focus:border-[#E11D2E] disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
              </div>
            </div>
          </div>

          <div
            className={`mt-5 rounded-2xl border p-5 ${
              !validCountedCash
                ? 'border-zinc-200 bg-zinc-50'
                : difference === 0
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-amber-200 bg-amber-50'
            }`}
          >
            <p className="text-xs font-semibold text-zinc-500">
              Diferencia de caja
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${
                !validCountedCash
                  ? 'text-zinc-400'
                  : difference === 0
                    ? 'text-emerald-700'
                    : 'text-amber-700'
              }`}
            >
              {validCountedCash
                ? formatSignedCurrency(
                    difference,
                  )
                : '—'}
            </p>

            {validCountedCash && (
              <p className="mt-2 text-xs text-zinc-600">
                {difference === 0
                  ? 'El efectivo contado coincide con el sistema.'
                  : difference > 0
                    ? 'Existe un sobrante de efectivo.'
                    : 'Existe un faltante de efectivo.'}
              </p>
            )}
          </div>
        </div>

        {/* Resultado */}
        <div className="rounded-2xl bg-[#0D0D0D] p-5 text-white shadow-sm sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Resultado
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Resumen del día
          </h2>

          <div className="mt-6 space-y-4">
            <ResultRow
              label="Ingresos"
              value={totalIncome}
            />

            <ResultRow
              label="Gastos"
              value={expenses}
              negative
            />

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-zinc-300">
                  Resultado neto
                </span>

                <strong className="text-2xl">
                  {formatCurrency(
                    netResult,
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-white/5 p-4">
            <p className="text-xs text-zinc-400">
              Estado
            </p>

            <p className="mt-1 text-sm font-semibold">
              {closed
                ? 'Corte cerrado'
                : 'Pendiente de cierre'}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmación */}
      {showConfirmation && !closed && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-semibold text-amber-900">
            ¿Confirmar cierre del día?
          </h3>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            El corte quedará registrado con los ingresos, gastos y diferencia de caja mostrados.
          </p>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                setShowConfirmation(
                  false,
                )
              }
              className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-600"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={
                handleCloseDay
              }
              className="h-10 rounded-xl bg-[#E11D2E] px-4 text-sm font-semibold text-white"
            >
              Sí, cerrar día
            </button>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-zinc-900">
              Acciones del corte
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Guarda el cierre antes de generar reportes definitivos.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled
              title="Pendiente de backend"
              className="h-10 cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100 px-4 text-sm font-semibold text-zinc-400"
            >
              Descargar PDF
            </button>

            <button
              type="button"
              disabled
              title="Pendiente de backend"
              className="h-10 cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100 px-4 text-sm font-semibold text-zinc-400"
            >
              Exportar Excel
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Imprimir
            </button>

            <button
              type="button"
              disabled={
                closed ||
                !validCountedCash
              }
              onClick={() =>
                setShowConfirmation(
                  true,
                )
              }
              className="h-10 rounded-xl bg-[#E11D2E] px-4 text-sm font-semibold text-white transition hover:bg-[#C91828] disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {closed
                ? 'Día cerrado'
                : 'Cerrar día'}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs text-zinc-400">
        Datos ficticios para la interfaz. Los valores reales serán obtenidos del backend cuando se implemente el cierre de caja.
      </p>
    </section>
  )
}

function MetricCard({
  label,
  amount,
  important = false,
  danger = false,
}: {
  label: string
  amount: number
  important?: boolean
  danger?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        important
          ? 'border-zinc-800 bg-[#1A1A1A] text-white'
          : 'border-zinc-200 bg-white'
      }`}
    >
      <p
        className={`text-xs ${
          important
            ? 'text-zinc-400'
            : 'text-zinc-500'
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          danger
            ? 'text-red-600'
            : ''
        }`}
      >
        {formatCurrency(
          amount,
        )}
      </p>
    </div>
  )
}

function PaymentMethodCard({
  label,
  amount,
}: {
  label: string
  amount: number
}) {
  return (
    <div className="bg-white p-5">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-zinc-900">
        {formatCurrency(
          amount,
        )}
      </p>
    </div>
  )
}

function ResultRow({
  label,
  value,
  negative = false,
}: {
  label: string
  value: number
  negative?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-zinc-400">
        {label}
      </span>

      <span
        className={`text-sm font-semibold ${
          negative
            ? 'text-red-400'
            : 'text-white'
        }`}
      >
        {negative ? '- ' : ''}
        {formatCurrency(
          value,
        )}
      </span>
    </div>
  )
}

function formatCurrency(
  value: number,
) {
  return `RD$${value.toLocaleString(
    'es-DO',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`
}

function formatSignedCurrency(
  value: number,
) {
  if (value === 0) {
    return 'RD$0.00'
  }

  const prefix =
    value > 0 ? '+' : '-'

  return `${prefix}${formatCurrency(
    Math.abs(value),
  )}`
}
