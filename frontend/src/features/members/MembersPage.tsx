import { useMemo, useState } from 'react'
import MemberForm from './MemberForm'
import type { NewMemberData } from './MemberForm'
import MemberDetail from './MemberDetail'

type Member = {
  id: number
  name: string
  phone: string
  code: string
  status: 'Activo' | 'Por vencer' | 'Sin membresía'
}

const initialMembers: Member[] = [
  {
    id: 1,
    name: 'Jhonatan Rodríguez',
    phone: '809-555-0148',
    code: 'JP-A012',
    status: 'Activo',
  },
  {
    id: 2,
    name: 'Yudelkis Hernández',
    phone: '829-555-0112',
    code: 'JP-A013',
    status: 'Activo',
  },
  {
    id: 3,
    name: 'Miguel Batista',
    phone: '849-555-0189',
    code: 'JP-A014',
    status: 'Por vencer',
  },
  {
    id: 4,
    name: 'Paola Alcántara',
    phone: '809-555-0197',
    code: 'JP-A015',
    status: 'Activo',
  },
]

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) {
      return members
    }

    return members.filter((member) => {
      return (
        member.name.toLowerCase().includes(term) ||
        member.code.toLowerCase().includes(term)
      )
    })
  }, [members, search])

  function handleSaveMember(newMember: NewMemberData) {
    const nextNumber = members.length + 1

    const member: Member = {
      id: Date.now(),
      name: newMember.name,
      phone: newMember.phone,
      code: `DEMO-${String(nextNumber).padStart(3, '0')}`,
      status: 'Sin membresía',
    }

    setMembers((currentMembers) => [
      member,
      ...currentMembers,
    ])

    setShowForm(false)

    setSuccessMessage(
      `${newMember.name} fue agregado correctamente en esta demostración.`,
    )
  }

  function getStatusClasses(status: Member['status']) {
    if (status === 'Activo') {
      return 'bg-emerald-50 text-emerald-700'
    }

    if (status === 'Por vencer') {
      return 'bg-amber-50 text-amber-700'
    }

    return 'bg-zinc-100 text-zinc-600'
  }

  if (selectedMember) {
    return (
      <MemberDetail
        member={selectedMember}
        onBack={() => setSelectedMember(null)}
      />
    )
  }

  return (
    <section>
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Comunidad JP GYM
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Miembros
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Consulta, busca y administra los miembros registrados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm(true)
            setSuccessMessage('')
          }}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#E11D2E] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#C91828]"
        >
          + Nuevo Miembro
        </button>
      </div>

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="font-bold"
            aria-label="Cerrar mensaje"
          >
            ✕
          </button>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="mt-7">
          <MemberForm
            onCancel={() => setShowForm(false)}
            onSave={handleSaveMember}
          />
        </div>
      )}

      {/* Tabla */}
      <div className="mt-7 rounded-2xl border border-zinc-200 bg-white shadow-sm">

        {/* Buscador */}
        <div className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute left-3 top-3 size-5 text-zinc-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o código..."
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-[#E11D2E]/50 focus:bg-white focus:ring-4 focus:ring-red-100"
            />
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-500">
            {filteredMembers.length} miembros visibles
          </div>
        </div>

        {/* Listado */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-4 font-semibold">
                  Miembro
                </th>

                <th className="px-5 py-4 font-semibold">
                  Teléfono
                </th>

                <th className="px-5 py-4 font-semibold">
                  Código
                </th>

                <th className="px-5 py-4 font-semibold">
                  Estado
                </th>

                <th className="px-5 py-4 text-right font-semibold">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="transition hover:bg-zinc-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-zinc-800">
                      {member.name}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-zinc-600">
                    {member.phone}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                      {member.code}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(member.status)}`}
                    >
                      {member.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedMember(member)}
                      className="text-sm font-semibold text-[#E11D2E] hover:underline"
                    >
                      Ver ficha
                    </button>
                  </td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-zinc-500"
                  >
                    No se encontraron miembros con esa búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-zinc-100 px-5 py-4 text-xs text-zinc-500">
          Datos de demostración. Los códigos DEMO son temporales hasta conectar la API.
        </div>
      </div>
    </section>
  )
}
