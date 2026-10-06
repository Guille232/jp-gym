import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type EmployeeRole =
  | 'Administrador'
  | 'Recepción'

type Employee = {
  id: number
  name: string
  phone: string
  role: EmployeeRole
  active: boolean
}

const initialEmployees: Employee[] = [
  {
    id: 1,
    name: 'José Peña',
    phone: '809-555-0101',
    role: 'Administrador',
    active: true,
  },
  {
    id: 2,
    name: 'María Castillo',
    phone: '829-555-0155',
    role: 'Recepción',
    active: true,
  },
]

export default function EmployeesPage() {
  const [employees, setEmployees] =
    useState<Employee[]>(initialEmployees)

  const [search, setSearch] = useState('')

  const [showForm, setShowForm] =
    useState(false)

  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null)

  const [employeeToDelete, setEmployeeToDelete] =
    useState<Employee | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const [role, setRole] = useState<
    EmployeeRole | ''
  >('')

  const [message, setMessage] =
    useState('')

  const filtered = useMemo(() => {
    const term =
      search.trim().toLowerCase()

    if (!term) {
      return employees
    }

    return employees.filter(
      (employee) =>
        employee.name
          .toLowerCase()
          .includes(term) ||
        employee.phone
          .toLowerCase()
          .includes(term) ||
        employee.role
          .toLowerCase()
          .includes(term),
    )
  }, [employees, search])

  function resetForm() {
    setName('')
    setPhone('')
    setRole('')
    setEditingEmployee(null)
    setShowForm(false)
  }

  function openNewEmployeeForm() {
    setEditingEmployee(null)
    setName('')
    setPhone('')
    setRole('')
    setMessage('')
    setShowForm(true)
  }

  function openEditEmployee(
    employee: Employee,
  ) {
    setEditingEmployee(employee)

    setName(employee.name)
    setPhone(employee.phone)
    setRole(employee.role)

    setMessage('')
    setShowForm(true)
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !name.trim() ||
      !phone.trim() ||
      !role
    ) {
      return
    }

    if (editingEmployee) {
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === editingEmployee.id
            ? {
                ...employee,
                name: name.trim(),
                phone: phone.trim(),
                role,
              }
            : employee,
        ),
      )

      setMessage(
        'La información del empleado fue actualizada correctamente.',
      )

      resetForm()
      return
    }

    const employee: Employee = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      role,
      active: true,
    }

    setEmployees((current) => [
      employee,
      ...current,
    ])

    setMessage(
      'Empleado registrado correctamente.',
    )

    resetForm()
  }

  function toggleEmployee(id: number) {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === id
          ? {
              ...employee,
              active: !employee.active,
            }
          : employee,
      ),
    )
  }

  function deleteEmployee() {
    if (!employeeToDelete) {
      return
    }

    setEmployees((current) =>
      current.filter(
        (employee) =>
          employee.id !==
          employeeToDelete.id,
      ),
    )

    setMessage(
      `${employeeToDelete.name} fue eliminado de la demostración.`,
    )

    setEmployeeToDelete(null)
  }

  return (
    <section>
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Personal
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Empleados
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Administra el personal con acceso
            al sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewEmployeeForm}
          className="h-11 rounded-xl bg-[#E11D2E] px-5 text-sm font-semibold text-white hover:bg-[#C91828]"
        >
          + Nuevo empleado
        </button>
      </div>

      {/* Mensaje */}
      {message && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{message}</span>

          <button
            type="button"
            onClick={() =>
              setMessage('')
            }
            className="font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">
                {editingEmployee
                  ? 'Editar empleado'
                  : 'Registrar empleado'}
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                {editingEmployee
                  ? 'Actualiza la información del empleado.'
                  : 'Completa los datos del nuevo empleado.'}
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
            >
              ✕
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Nombre *
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                required
                placeholder="Nombre completo"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E] focus:ring-4 focus:ring-red-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Teléfono *
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value,
                  )
                }
                required
                placeholder="809-555-0000"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E] focus:ring-4 focus:ring-red-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Rol *
              </label>

              <select
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target
                      .value as
                      | EmployeeRole
                      | '',
                  )
                }
                required
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
              >
                <option value="">
                  Selecciona
                </option>

                <option value="Administrador">
                  Administrador
                </option>

                <option value="Recepción">
                  Recepción
                </option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="h-11 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="h-11 rounded-xl bg-[#E11D2E] px-5 text-sm font-semibold text-white hover:bg-[#C91828]"
            >
              {editingEmployee
                ? 'Guardar cambios'
                : 'Guardar empleado'}
            </button>
          </div>
        </form>
      )}

      {/* Confirmación eliminar */}
      {employeeToDelete && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-semibold text-red-700">
            ¿Eliminar empleado?
          </h3>

          <p className="mt-2 text-sm text-zinc-700">
            Se eliminará a{' '}
            <strong>
              {employeeToDelete.name}
            </strong>{' '}
            de esta demostración.
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            Esta acción solo afecta los datos
            temporales del frontend.
          </p>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                setEmployeeToDelete(
                  null,
                )
              }
              className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-600"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={deleteEmployee}
              className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-5">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Buscar empleado, teléfono o rol..."
            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-4">
                  Empleado
                </th>

                <th className="px-5 py-4">
                  Teléfono
                </th>

                <th className="px-5 py-4">
                  Rol
                </th>

                <th className="px-5 py-4">
                  Estado
                </th>

                <th className="px-5 py-4 text-right">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {filtered.map(
                (employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {employee.name}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {employee.phone}
                    </td>

                    <td className="px-5 py-4">
                      {employee.role}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          employee.active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {employee.active
                          ? 'Activo'
                          : 'Inactivo'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            openEditEmployee(
                              employee,
                            )
                          }
                          className="text-xs font-semibold text-zinc-700 hover:text-[#E11D2E]"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleEmployee(
                              employee.id,
                            )
                          }
                          className="text-xs font-semibold text-[#E11D2E]"
                        >
                          {employee.active
                            ? 'Desactivar'
                            : 'Activar'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEmployeeToDelete(
                              employee,
                            )
                          }
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
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
                    No se encontraron empleados.
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
