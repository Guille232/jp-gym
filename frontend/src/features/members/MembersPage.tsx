import { useMemo, useState } from 'react'

import MemberForm from './MemberForm'
import MemberDetail from './MemberDetail'

import type {
  NewMemberData,
} from './MemberForm'

import type {
  MemberDetailData,
} from './MemberDetail'

import type {
  MemberEditData,
} from './MemberEditForm'

import type {
  MembershipFormData,
  MembershipRecord,
} from './MembershipForm'

const initialMembers: MemberDetailData[] = [
  {
    id: 1,
    code: 'JP-A012',
    name: 'Jhonatan Rodríguez',
    phone: '809-555-0148',
    cedula: '001-1234567-8',
    age: 28,
    address: 'Villa Juana, Santo Domingo',
    status: 'Activo',
    membershipHistory: [
      {
        id: 101,
        planName: 'Mensualidad JP GYM',
        suggestedPrice: 1500,
        agreedPrice: 1500,
        reason: '',
        method: 'Efectivo',
        paymentDate: '20/09/2026',
        startDate: '20/09/2026',
        endDate: '19/10/2026',
        receiptNumber: 'JP-REC-000101',
      },
    ],
  },

  {
    id: 2,
    code: 'JP-A013',
    name: 'Yudelkis Hernández',
    phone: '829-555-0112',
    cedula: '001-7654321-0',
    age: 31,
    address: 'Santo Domingo Norte',
    status: 'Activo',
    membershipHistory: [
      {
        id: 102,
        planName: 'Mensualidad JP GYM',
        suggestedPrice: 1500,
        agreedPrice: 1500,
        reason: '',
        method: 'Tarjeta',
        paymentDate: '15/09/2026',
        startDate: '15/09/2026',
        endDate: '14/10/2026',
        receiptNumber: 'JP-REC-000102',
      },
    ],
  },

  {
    id: 3,
    code: 'JP-A014',
    name: 'Miguel Batista',
    phone: '849-555-0189',
    cedula: '402-1234567-9',
    age: 24,
    address: 'Ensanche Espaillat, Santo Domingo',
    status: 'Por vencer',
    membershipHistory: [
      {
        id: 103,
        planName: 'Mensualidad JP GYM',
        suggestedPrice: 1500,
        agreedPrice: 1400,
        reason: 'Precio especial autorizado',
        method: 'Transferencia',
        paymentDate: '08/09/2026',
        startDate: '08/09/2026',
        endDate: '07/10/2026',
        receiptNumber: 'JP-REC-000103',
      },
    ],
  },

  {
    id: 4,
    code: 'JP-A099',
    name: 'Carlos Méndez',
    phone: '809-555-0202',
    cedula: '001-5555555-5',
    age: 35,
    address: 'Los Guandules, Santo Domingo',
    status: 'Sin membresía',
    membershipHistory: [],
  },
]

function formatDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    'es-DO',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  ).format(date)
}

function parseDisplayDate(
  value: string,
) {
  const [day, month, year] =
    value.split('/').map(Number)

  return new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0,
  )
}

function addOneMonth(
  date: Date,
) {
  const result = new Date(date)

  result.setMonth(
    result.getMonth() + 1,
  )

  return result
}

function subtractOneDay(
  date: Date,
) {
  const result = new Date(date)

  result.setDate(
    result.getDate() - 1,
  )

  return result
}

function generateReceiptNumber() {
  const timestamp =
    Date.now().toString()

  return `JP-REC-${timestamp.slice(-8)}`
}

export default function MembersPage() {
  const [members, setMembers] =
    useState<MemberDetailData[]>(
      initialMembers,
    )

  const [search, setSearch] =
    useState('')

  const [showForm, setShowForm] =
    useState(false)

  const [
    selectedMemberId,
    setSelectedMemberId,
  ] = useState<number | null>(
    null,
  )

  const [monthlyFee, setMonthlyFee] =
    useState(1500)

  const [editingFee, setEditingFee] =
    useState(false)

  const [feeDraft, setFeeDraft] =
    useState('1500')

  const selectedMember =
    members.find(
      (member) =>
        member.id ===
        selectedMemberId,
    ) ?? null

  const filteredMembers =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase()

      if (!term) {
        return members
      }

      return members.filter(
        (member) =>
          member.name
            .toLowerCase()
            .includes(term) ||
          member.code
            .toLowerCase()
            .includes(term) ||
          member.phone
            .toLowerCase()
            .includes(term),
      )
    }, [members, search])

  const activeCount =
    members.filter(
      (member) =>
        member.status ===
        'Activo',
    ).length

  const expiringCount =
    members.filter(
      (member) =>
        member.status ===
        'Por vencer',
    ).length

  const withoutMembership =
    members.filter(
      (member) =>
        member.status ===
        'Sin membresía',
    ).length

  function handleCreateMember(
    data: NewMemberData,
  ) {
    const nextId =
      Math.max(
        0,
        ...members.map(
          (member) =>
            member.id,
        ),
      ) + 1

    const demoCode =
      `DEMO-${String(
        nextId,
      ).padStart(3, '0')}`

    const newMember: MemberDetailData =
      {
        id: nextId,
        code: demoCode,
        name: data.name,
        phone: data.phone,
        cedula:
          data.cedula,
        age: data.age,
        address:
          data.address,
        status:
          'Sin membresía',
        membershipHistory:
          [],
      }

    setMembers((current) => [
      newMember,
      ...current,
    ])

    setShowForm(false)

    setSelectedMemberId(
      newMember.id,
    )
  }

  function handleEditMember(
    memberId: number,
    data: MemberEditData,
  ) {
    setMembers((current) =>
      current.map(
        (member) =>
          member.id ===
          memberId
            ? {
                ...member,
                name: data.name,
                phone:
                  data.phone,
                cedula:
                  data.cedula,
                age: data.age,
                address:
                  data.address,
              }
            : member,
      ),
    )
  }

  function handleDeleteMember(
    memberId: number,
  ) {
    setMembers((current) =>
      current.filter(
        (member) =>
          member.id !==
          memberId,
      ),
    )

    setSelectedMemberId(
      null,
    )
  }

  function handleRegisterMembership(
    memberId: number,
    data: MembershipFormData,
  ): MembershipRecord {
    const member =
      members.find(
        (item) =>
          item.id ===
          memberId,
      )

    if (!member) {
      throw new Error(
        'Miembro no encontrado.',
      )
    }

    const today =
      new Date()

    today.setHours(
      12,
      0,
      0,
      0,
    )

    const latestRecord =
      member.membershipHistory[0]

    let startDate =
      new Date(today)

    if (latestRecord) {
      const latestEnd =
        parseDisplayDate(
          latestRecord.endDate,
        )

      if (
        latestEnd >= today
      ) {
        startDate =
          new Date(
            latestEnd,
          )

        startDate.setDate(
          startDate.getDate() +
            1,
        )
      }
    }

    const exclusiveEnd =
      addOneMonth(
        startDate,
      )

    const lastValidDay =
      subtractOneDay(
        exclusiveEnd,
      )

    const record: MembershipRecord =
      {
        id: Date.now(),
        planName:
          'Mensualidad JP GYM',
        suggestedPrice:
          monthlyFee,
        agreedPrice:
          data.agreedPrice,
        reason:
          data.reason,
        method:
          data.method,
        paymentDate:
          formatDate(today),
        startDate:
          formatDate(
            startDate,
          ),
        endDate:
          formatDate(
            lastValidDay,
          ),
        receiptNumber:
          generateReceiptNumber(),
      }

    setMembers((current) =>
      current.map(
        (currentMember) =>
          currentMember.id ===
          memberId
            ? {
                ...currentMember,
                status:
                  'Activo',
                membershipHistory:
                  [
                    record,
                    ...currentMember.membershipHistory,
                  ],
              }
            : currentMember,
      ),
    )

    return record
  }

  function saveMonthlyFee() {
    const value =
      Number(feeDraft)

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      return
    }

    setMonthlyFee(value)
    setEditingFee(false)
  }

  if (selectedMember) {
    return (
      <MemberDetail
        member={
          selectedMember
        }
        monthlyFee={
          monthlyFee
        }
        onBack={() =>
          setSelectedMemberId(
            null,
          )
        }
        onEdit={
          handleEditMember
        }
        onDelete={
          handleDeleteMember
        }
        onRegisterMembership={
          handleRegisterMembership
        }
      />
    )
  }

  if (showForm) {
    return (
      <MemberForm
        onCancel={() =>
          setShowForm(false)
        }
        onSave={
          handleCreateMember
        }
      />
    )
  }

  return (
    <section>
      {/* Encabezado */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Membresía
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Miembros
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Registra, consulta y administra los miembros de JP GYM.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm(true)
          }
          className="h-11 rounded-xl bg-[#E11D2E] px-5 text-sm font-semibold text-white transition hover:bg-[#C91828]"
        >
          + Nuevo miembro
        </button>
      </div>

      {/* Mensualidad */}
      <div className="mt-7 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500">
              Mensualidad actual
            </p>

            <p className="mt-2 text-2xl font-bold text-zinc-900">
              RD$
              {monthlyFee.toLocaleString(
                'es-DO',
                {
                  minimumFractionDigits: 2,
                },
              )}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Precio sugerido para nuevas contrataciones y renovaciones.
            </p>
          </div>

          {!editingFee ? (
            <button
              type="button"
              onClick={() => {
                setFeeDraft(
                  String(
                    monthlyFee,
                  ),
                )

                setEditingFee(
                  true,
                )
              }}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Editar mensualidad
            </button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-zinc-500">
                  RD$
                </span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    feeDraft
                  }
                  onChange={(
                    event,
                  ) =>
                    setFeeDraft(
                      event
                        .target
                        .value,
                    )
                  }
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-11 pr-3 text-sm outline-none focus:border-[#E11D2E] sm:w-40"
                />
              </div>

              <button
                type="button"
                onClick={
                  saveMonthlyFee
                }
                className="h-10 rounded-xl bg-[#E11D2E] px-4 text-sm font-semibold text-white"
              >
                Guardar
              </button>

              <button
                type="button"
                onClick={() =>
                  setEditingFee(
                    false,
                  )
                }
                className="h-10 rounded-xl border border-zinc-200 px-4 text-sm font-semibold text-zinc-600"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total miembros"
          value={
            members.length
          }
        />

        <SummaryCard
          label="Activos"
          value={activeCount}
          type="active"
        />

        <SummaryCard
          label="Por vencer"
          value={
            expiringCount
          }
          type="warning"
        />

        <SummaryCard
          label="Sin membresía"
          value={
            withoutMembership
          }
          type="neutral"
        />
      </div>

      {/* Listado */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-5">
          <label className="mb-2 block text-xs font-semibold text-zinc-600">
            Buscar miembro
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
            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-[#E11D2E] focus:bg-white"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-4">
                  Código
                </th>

                <th className="px-5 py-4">
                  Miembro
                </th>

                <th className="px-5 py-4">
                  Teléfono
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
              {filteredMembers.map(
                (member) => (
                  <tr
                    key={member.id}
                    className="transition hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4 font-semibold text-zinc-600">
                      {member.code}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-zinc-900">
                        {
                          member.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        {
                          member.age
                        }{' '}
                        años
                      </p>
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {
                        member.phone
                      }
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={
                          member.status
                        }
                      />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMemberId(
                            member.id,
                          )
                        }
                        className="text-xs font-semibold text-[#E11D2E] hover:underline"
                      >
                        Ver ficha
                      </button>
                    </td>
                  </tr>
                ),
              )}

              {filteredMembers.length ===
                0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-zinc-500"
                  >
                    No se encontraron miembros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-4 text-xs text-zinc-500">
          Los códigos DEMO son temporales. Cuando conectemos el backend, JP GYM utilizará el código generado por el servidor.
        </div>
      </div>
    </section>
  )
}

function SummaryCard({
  label,
  value,
  type = 'default',
}: {
  label: string
  value: number
  type?:
    | 'default'
    | 'active'
    | 'warning'
    | 'neutral'
}) {
  const valueClass =
    type === 'active'
      ? 'text-emerald-700'
      : type === 'warning'
        ? 'text-amber-700'
        : type === 'neutral'
          ? 'text-zinc-500'
          : 'text-zinc-900'

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${valueClass}`}
      >
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
