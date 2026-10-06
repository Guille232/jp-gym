import { useState } from 'react'
import type { FormEvent } from 'react'

export type PaymentMethod =
  | 'Efectivo'
  | 'Tarjeta'
  | 'Transferencia'

export type MembershipFormData = {
  agreedPrice: number
  reason: string
  method: PaymentMethod
}

export type MembershipRecord = {
  id: number
  planName: string
  suggestedPrice: number
  agreedPrice: number
  reason: string
  method: PaymentMethod
  paymentDate: string
  startDate: string
  endDate: string
  receiptNumber: string
}

type MembershipFormProps = {
  monthlyFee: number
  mode: 'enroll' | 'renew'
  onCancel: () => void
  onConfirm: (
    data: MembershipFormData,
  ) => void
}

export default function MembershipForm({
  monthlyFee,
  mode,
  onCancel,
  onConfirm,
}: MembershipFormProps) {
  const [agreedPrice, setAgreedPrice] =
    useState(String(monthlyFee))

  const [reason, setReason] =
    useState('')

  const [method, setMethod] =
    useState<PaymentMethod | ''>('')

  const [transferConfirmed, setTransferConfirmed] =
    useState(false)

  const [error, setError] =
    useState('')

  const numericPrice =
    Number(agreedPrice)

  const priceChanged =
    Number.isFinite(numericPrice) &&
    numericPrice !== monthlyFee

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      setError(
        'Ingresa un precio acordado válido.',
      )
      return
    }

    if (
      priceChanged &&
      !reason.trim()
    ) {
      setError(
        'Debes indicar el motivo cuando el precio acordado cambia.',
      )
      return
    }

    if (!method) {
      setError(
        'Selecciona un método de pago.',
      )
      return
    }

    if (
      method === 'Transferencia' &&
      !transferConfirmed
    ) {
      setError(
        'Confirma que la transferencia fue recibida antes de registrar el pago.',
      )
      return
    }

    onConfirm({
      agreedPrice: numericPrice,
      reason: reason.trim(),
      method,
    })
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5 sm:p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D2E]">
            Membresía
          </p>

          <h2 className="mt-2 text-xl font-bold text-zinc-900">
            {mode === 'enroll'
              ? 'Contratar membresía'
              : 'Renovar membresía'}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            El pago debe cubrir el importe completo.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
        >
          ✕
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 sm:p-6"
      >
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-700">
              Plan
            </label>

            <input
              type="text"
              value="Mensualidad JP GYM"
              disabled
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-100 px-4 text-sm font-semibold text-zinc-600"
            />

            <p className="mt-2 text-[11px] text-zinc-400">
              Plan único utilizado actualmente en la demostración.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-700">
              Precio sugerido
            </label>

            <div className="flex h-11 items-center rounded-xl border border-zinc-200 bg-zinc-100 px-4 text-sm font-semibold text-zinc-700">
              RD$
              {monthlyFee.toLocaleString(
                'es-DO',
                {
                  minimumFractionDigits: 2,
                },
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-700">
              Precio acordado *
            </label>

            <div className="relative">
              <span className="absolute left-4 top-3 text-sm font-semibold text-zinc-500">
                RD$
              </span>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={agreedPrice}
                onChange={(event) =>
                  setAgreedPrice(
                    event.target.value,
                  )
                }
                required
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-sm font-semibold outline-none focus:border-[#E11D2E]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-700">
              Método de pago *
            </label>

            <select
              value={method}
              onChange={(event) => {
                const value =
                  event.target
                    .value as
                    | PaymentMethod
                    | ''

                setMethod(value)

                if (
                  value !==
                  'Transferencia'
                ) {
                  setTransferConfirmed(
                    false,
                  )
                }
              }}
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
          </div>

          {priceChanged && (
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold text-zinc-700">
                Motivo del cambio de precio *
              </label>

              <textarea
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value,
                  )
                }
                maxLength={250}
                required
                rows={3}
                placeholder="Ej. Precio especial autorizado por administración"
                className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-[#E11D2E]"
              />

              <p className="mt-2 text-right text-[11px] text-zinc-400">
                {reason.length}/250
              </p>
            </div>
          )}

          {method ===
            'Transferencia' && (
            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <input
                  type="checkbox"
                  checked={
                    transferConfirmed
                  }
                  onChange={(event) =>
                    setTransferConfirmed(
                      event.target
                        .checked,
                    )
                  }
                  className="mt-0.5 size-4"
                />

                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Transferencia recibida
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    Confirmo que el dinero fue recibido antes de registrar este pago.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-zinc-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-zinc-500">
              Total a cobrar
            </span>

            <strong className="text-xl text-zinc-900">
              RD$
              {(Number.isFinite(
                numericPrice,
              )
                ? numericPrice
                : 0
              ).toLocaleString(
                'es-DO',
                {
                  minimumFractionDigits: 2,
                },
              )}
            </strong>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="h-11 rounded-xl bg-[#E11D2E] px-5 text-sm font-semibold text-white hover:bg-[#C91828]"
          >
            Confirmar pago
          </button>
        </div>
      </form>
    </section>
  )
}
