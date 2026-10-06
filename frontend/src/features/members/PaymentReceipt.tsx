export type ReceiptData = {
  receiptNumber: string
  memberName: string
  memberCode: string
  amount: number
  method: string
  paymentDate: string
  periodStart: string
  periodEnd: string
}

type PaymentReceiptProps = {
  receipt: ReceiptData
  onClose: () => void
}

export default function PaymentReceipt({
  receipt,
  onClose,
}: PaymentReceiptProps) {
  function handlePrint() {
    window.print()
  }

  function formatCurrency(value: number) {
    return `RD$${value.toLocaleString(
      'es-DO',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Encabezado de la pantalla */}
      <div className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D2E]">
            Pago confirmado
          </p>

          <h2 className="mt-2 text-xl font-bold text-zinc-900">
            Factura de pago
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Consulta, imprime o exporta la factura del pago realizado.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar factura"
          className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50"
        >
          ✕
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {/* FACTURA */}
        <div
          id="payment-receipt"
          className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
        >
          {/* Cabecera factura */}
          <div className="bg-[#0D0D0D] p-6 text-white sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/jp-gym-logo.png"
                  alt="JP GYM"
                  className="size-20 rounded-2xl border border-white/10 object-cover"
                />

                <div>
                  <p className="text-2xl font-extrabold tracking-wide">
                    JP GYM
                  </p>

                  <p className="mt-1 text-sm text-zinc-400">
                    Sistema administrativo
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Factura
                </p>

                <p className="mt-2 text-lg font-bold">
                  {receipt.receiptNumber}
                </p>

                <span className="mt-3 inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                  PAGADA
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Información principal */}
            <div className="grid grid-cols-1 gap-6 border-b border-zinc-100 pb-6 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Facturado a
                </p>

                <p className="mt-2 text-lg font-bold text-zinc-900">
                  {receipt.memberName}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Código: {receipt.memberCode}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Fecha de emisión
                </p>

                <p className="mt-2 text-sm font-semibold text-zinc-900">
                  {receipt.paymentDate}
                </p>

                <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Método de pago
                </p>

                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {receipt.method}
                </p>
              </div>
            </div>

            {/* Conceptos */}
            <div className="mt-7">
              <h3 className="text-sm font-bold text-zinc-900">
                Detalle de la factura
              </h3>

              <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-200">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-zinc-50 text-[10px] uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">
                        Concepto
                      </th>

                      <th className="px-4 py-3 text-center">
                        Cant.
                      </th>

                      <th className="px-4 py-3 text-right">
                        Precio
                      </th>

                      <th className="px-4 py-3 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-t border-zinc-100">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-zinc-900">
                          Mensualidad JP GYM
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          Período: {receipt.periodStart} - {receipt.periodEnd}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-center text-zinc-600">
                        1
                      </td>

                      <td className="px-4 py-4 text-right text-zinc-600">
                        {formatCurrency(
                          receipt.amount,
                        )}
                      </td>

                      <td className="px-4 py-4 text-right font-semibold text-zinc-900">
                        {formatCurrency(
                          receipt.amount,
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Periodo */}
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InvoiceInfo
                label="Inicio de membresía"
                value={receipt.periodStart}
              />

              <InvoiceInfo
                label="Último día válido"
                value={receipt.periodEnd}
              />
            </div>

            {/* Totales */}
            <div className="mt-7 flex justify-end">
              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 py-3">
                  <span className="text-sm text-zinc-500">
                    Subtotal
                  </span>

                  <span className="text-sm font-semibold text-zinc-900">
                    {formatCurrency(
                      receipt.amount,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-100 py-3">
                  <span className="text-sm text-zinc-500">
                    Total pagado
                  </span>

                  <strong className="text-xl text-zinc-900">
                    {formatCurrency(
                      receipt.amount,
                    )}
                  </strong>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-zinc-500">
                    Balance pendiente
                  </span>

                  <strong className="text-sm text-emerald-700">
                    RD$0.00
                  </strong>
                </div>
              </div>
            </div>

            {/* Pie */}
            <div className="mt-8 rounded-2xl bg-zinc-50 p-5 text-center">
              <p className="text-sm font-semibold text-zinc-800">
                Gracias por ser parte de JP GYM
              </p>

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Conserva esta factura como comprobante de tu pago.
              </p>

              <p className="mt-2 text-[10px] leading-5 text-zinc-400">
                Documento interno del sistema administrativo de JP GYM.
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            disabled
            title="Pendiente de conexión con backend"
            className="h-11 cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100 px-4 text-sm font-semibold text-zinc-400"
          >
            Descargar PDF
          </button>

          <button
            type="button"
            disabled
            title="Pendiente de conexión con backend"
            className="h-11 cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100 px-4 text-sm font-semibold text-zinc-400"
          >
            Exportar Excel
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Imprimir
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl bg-[#E11D2E] px-4 text-sm font-semibold text-white transition hover:bg-[#C91828]"
          >
            Cerrar
          </button>
        </div>

        {/* Backend */}
        <div className="mx-auto mt-4 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-900">
            Integración pendiente
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-800">
            Cuando Guillermo termine factura, PDF y Excel, estos botones se
            conectarán al documento definitivo generado por el backend.
          </p>
        </div>
      </div>
    </section>
  )
}

function InvoiceInfo({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-zinc-800">
        {value}
      </p>
    </div>
  )
}
