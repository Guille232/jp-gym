import { useMemo, useState } from 'react'

type Attendance = {
  id: number
  name: string
  code: string
  date: string
  time: string
  registeredBy: string
}

const attendanceData: Attendance[] = [
  {
    id: 1,
    name: 'Jhonatan Rodríguez',
    code: 'JP-A012',
    date: '2026-10-05',
    time: '08:13 AM',
    registeredBy: 'Recepción',
  },
  {
    id: 2,
    name: 'Yudelkis Hernández',
    code: 'JP-A013',
    date: '2026-10-05',
    time: '09:05 AM',
    registeredBy: 'Recepción',
  },
  {
    id: 3,
    name: 'Miguel Batista',
    code: 'JP-A014',
    date: '2026-10-05',
    time: '10:42 AM',
    registeredBy: 'Administrador',
  },
  {
    id: 4,
    name: 'Paola Alcántara',
    code: 'JP-A015',
    date: '2026-10-04',
    time: '06:18 PM',
    registeredBy: 'Recepción',
  },
  {
    id: 5,
    name: 'Jhonatan Rodríguez',
    code: 'JP-A012',
    date: '2026-10-04',
    time: '07:14 AM',
    registeredBy: 'Recepción',
  },
]

export default function AttendancePage() {
  const [date, setDate] =
    useState('2026-10-05')

  const [search, setSearch] =
    useState('')

  const filtered = useMemo(() => {
    const term =
      search.trim().toLowerCase()

    return attendanceData.filter(
      (item) => {
        const matchesDate =
          !date ||
          item.date === date

        const matchesSearch =
          !term ||
          item.name
            .toLowerCase()
            .includes(term) ||
          item.code
            .toLowerCase()
            .includes(term)

        return (
          matchesDate &&
          matchesSearch
        )
      },
    )
  }, [date, search])

  const uniqueMembers =
    new Set(
      filtered.map(
        (item) => item.code,
      ),
    ).size

  return (
    <section>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Control de acceso
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Asistencia
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Consulta las entradas registradas
          de los miembros.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-zinc-500">
            Entradas encontradas
          </p>

          <p className="mt-2 text-3xl font-bold">
            {filtered.length}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-zinc-500">
            Miembros distintos
          </p>

          <p className="mt-2 text-3xl font-bold">
            {uniqueMembers}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-4 border-b border-zinc-100 p-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-600">
              Fecha
            </label>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
            />
          </div>

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
                  Fecha
                </th>

                <th className="px-5 py-4">
                  Hora
                </th>

                <th className="px-5 py-4">
                  Registrado por
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {filtered.map(
                (attendance) => (
                  <tr
                    key={attendance.id}
                    className="hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {attendance.name}
                    </td>

                    <td className="px-5 py-4">
                      {attendance.code}
                    </td>

                    <td className="px-5 py-4">
                      {attendance.date}
                    </td>

                    <td className="px-5 py-4">
                      {attendance.time}
                    </td>

                    <td className="px-5 py-4 text-zinc-500">
                      {
                        attendance.registeredBy
                      }
                    </td>
                  </tr>
                ),
              )}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-zinc-500"
                  >
                    No hay asistencias para
                    estos filtros.
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
