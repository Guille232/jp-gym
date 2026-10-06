import { useState } from 'react'

import MemberEditForm from './MemberEditForm'
import MembershipForm from './MembershipForm'
import PaymentReceipt from './PaymentReceipt'

import type {
  MemberEditData,
} from './MemberEditForm'

import type {
  MembershipFormData,
  MembershipRecord,
} from './MembershipForm'

import type {
  ReceiptData,
} from './PaymentReceipt'

export type MemberDetailData = {
  id: number
  code: string
  name: string
  phone: string
  cedula: string
  age: number
  address: string
  status:
    | 'Activo'
    | 'Por vencer'
    | 'Sin membresía'
  membershipHistory: MembershipRecord[]
}

type MemberDetailProps = {
  member: MemberDetailData
  monthlyFee: number
  onBack: () => void
  onEdit: (
    memberId: number,
    data: MemberEditData,
  ) => void
  onDelete: (
    memberId: number,
  ) => void
  onRegisterMembership: (
    memberId: number,
    data: MembershipFormData,
  ) => MembershipRecord
}

export default function MemberDetail({
  member,
  monthlyFee,
  onBack,
  onEdit,
  onDelete,
  onRegisterMembership,
}: MemberDetailProps) {
  const [editing, setEditing] =
    useState(false)

  const [membershipMode, setMembershipMode] =
    useState<
      'enroll' | 'renew' | null
    >(null)

  const [showDelete, setShowDelete] =
    useState(false)

  const [receipt, setReceipt] =
    useState<ReceiptData | null>(
      null,
    )

  const latestMembership =
    member.membershipHistory[0]

  function handleMembershipConfirm(
    data: MembershipFormData,
  ) {
    const created =
      onRegisterMembership(
        member.id,
        data,
      )

    setMembershipMode(null)

    setReceipt({
      receiptNumber:
        created.receiptNumber,
      memberName: member.name,
      memberCode: member.code,
      amount: created.agreedPrice,
      method: created.method,
      paymentDate:
        created.paymentDate,
      periodStart:
        created.startDate,
      periodEnd:
        created.endDate,
    })
  }

  function showReceiptForRecord(
    record: MembershipRecord,
  ) {
    setReceipt({
      receiptNumber:
        record.receiptNumber,
      memberName: member.name,
      memberCode: member.code,
      amount: record.agreedPrice,
      method: record.method,
      paymentDate:
        record.paymentDate,
      periodStart:
        record.startDate,
      periodEnd:
        record.endDate,
    })
  }

  if (receipt) {
    return (
      <PaymentReceipt
        receipt={receipt}
        onClose={() =>
          setReceipt(null)
        }
      />
    )
  }

  if (editing) {
    return (
      <MemberEditForm
        member={{
          name: member.name,
          phone: member.phone,
          cedula: member.cedula,
          age: member.age,
          address: member.address,
        }}
        onCancel={() =>
          setEditing(false)
        }
        onSave={(data) => {
          onEdit(member.id, data)
          setEditing(false)
        }}
      />
    )
  }

  if (membershipMode) {
    return (
      <MembershipForm
        monthlyFee={monthlyFee}
        mode={membershipMode}
        onCancel={() =>
          setMembershipMode(null)
        }
        onConfirm={
          handleMembershipConfirm
        }
      />
    )
  }

  return (
    <section>
      {/* Volver */}
      <button
        type="button"
        onClick={onBack}
        className="mb-5 text-sm font-semibold text-zinc-500 transition hover:text-zinc-900"
      >
        ← Volver a miembros
      </button>

      {/* Encabezado */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#0D0D0D] text-lg font-bold text-white">
              {member.name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((word) =>
                  word
                    .charAt(0)
                    .toUpperCase(),
                )
                .join('')}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-zinc-900">
                  {member.name}
                </h1>

                <StatusBadge
                  status={
                    member.status
                  }
                />
              </div>

              <p className="mt-2 text-sm font-semibold text-zinc-500">
                {member.code}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setEditing(true)
              }
              className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() =>
                setShowDelete(true)
              }
              className="h-10 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              Eliminar
            </button>
          </div>
        </div>

        {/* Datos */}
        <div className="grid grid-cols-1 gap-px border-t border-zinc-100 bg-zinc-100 sm:grid-cols-2 lg:grid-cols-4">
          <MemberInfo
            label="Teléfono"
            value={member.phone}
          />

          <MemberInfo
            label="Cédula / Documento"
            value={
              member.cedula ||
              'No registrado'
            }
          />

          <MemberInfo
            label="Edad"
            value={`${member.age} años`}
          />

          <MemberInfo
            label="Dirección"
            value={
              member.address ||
              'No registrada'
            }
          />
        </div>
      </div>

      {/* Confirmación eliminar */}
      {showDelete && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-700">
            ¿Eliminar miembro?
          </h2>

          <p className="mt-2 text-sm text-zinc-700">
            Se eliminará a{' '}
            <strong>
              {member.name}
            </strong>{' '}
            únicamente de esta demostración.
          </p>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                setShowDelete(false)
              }
              className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-600"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() =>
                onDelete(member.id)
              }
              className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      )}

      {/* Membresía */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-zinc-900">
              Membresía
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Estado actual y renovación.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setMembershipMode(
                latestMembership
                  ? 'renew'
                  : 'enroll',
              )
            }
            className="h-10 rounded-xl bg-[#E11D2E] px-4 text-sm font-semibold text-white hover:bg-[#C91828]"
          >
            {latestMembership
              ? 'Renovar membresía'
              : 'Contratar membresía'}
          </button>
        </div>

        {latestMembership ? (
          <div className="grid grid-cols-1 gap-px bg-zinc-100 sm:grid-cols-2 lg:grid-cols-4">
            <MemberInfo
              label="Plan"
              value={
                latestMembership.planName
              }
            />

            <MemberInfo
              label="Pagado"
              value={`RD$${latestMembership.agreedPrice.toLocaleString(
                'es-DO',
                {
                  minimumFractionDigits: 2,
                },
              )}`}
            />

            <MemberInfo
              label="Método"
              value={
                latestMembership.method
              }
            />

            <MemberInfo
              label="Período"
              value={`${latestMembership.startDate} - ${latestMembership.endDate}`}
            />
          </div>
        ) : (
          <div className="p-6 text-sm text-zinc-500">
            Este miembro todavía no tiene una membresía contratada.
          </div>
        )}
      </div>

      {/* Historial */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-5">
          <h2 className="font-semibold text-zinc-900">
            Membresías y pagos
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Historial de períodos contratados y pagos realizados.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-4">
                  Fecha pago
                </th>

                <th className="px-5 py-4">
                  Período
                </th>

                <th className="px-5 py-4">
                  Precio sugerido
                </th>

                <th className="px-5 py-4">
                  Pagado
                </th>

                <th className="px-5 py-4">
                  Método
                </th>

                <th className="px-5 py-4">
                  Motivo
                </th>

                <th className="px-5 py-4 text-right">
                  Comprobante
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {member.membershipHistory.map(
                (record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4">
                      {record.paymentDate}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {record.startDate}
                      {' - '}
                      {record.endDate}
                    </td>

                    <td className="px-5 py-4">
                      RD$
                      {record.suggestedPrice.toLocaleString(
                        'es-DO',
                        {
                          minimumFractionDigits: 2,
                        },
                      )}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      RD$
                      {record.agreedPrice.toLocaleString(
                        'es-DO',
                        {
                          minimumFractionDigits: 2,
                        },
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {record.method}
                    </td>

                    <td className="px-5 py-4 text-zinc-500">
                      {record.reason ||
                        '—'}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          showReceiptForRecord(
                            record,
                          )
                        }
                        className="text-xs font-semibold text-[#E11D2E] hover:underline"
                      >
                        Ver comprobante
                      </button>
                    </td>
                  </tr>
                ),
              )}

              {member
                .membershipHistory
                .length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-zinc-500"
                  >
                    No hay pagos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-5 text-xs text-zinc-400">
        El PDF definitivo y su descarga están pendientes de conexión con el backend.
      </p>
    </section>
  )
}

function MemberInfo({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="bg-white p-5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-zinc-800">
        {value}
      </p>
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status:
    | 'Activo'
    | 'Por vencer'
    | 'Sin membresía'
}) {
  const classes =
    status === 'Activo'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'Por vencer'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-zinc-100 text-zinc-600'

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  )
}
