import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type Trainer = {
  id: number
  name: string
  phone: string
  specialty: string
  active: boolean
}

const initialTrainers: Trainer[] = [
  {
    id: 1,
    name: 'Rafael Gómez',
    phone: '809-555-0331',
    specialty: 'Fuerza y musculación',
    active: true,
  },
  {
    id: 2,
    name: 'Laura Hernández',
    phone: '829-555-0224',
    specialty: 'Acondicionamiento físico',
    active: true,
  },
]

export default function TrainersPage() {
  const [trainers, setTrainers] =
    useState<Trainer[]>(initialTrainers)

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [editingTrainer, setEditingTrainer] =
    useState<Trainer | null>(null)

  const [trainerToDelete, setTrainerToDelete] =
    useState<Trainer | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [specialty, setSpecialty] = useState('')

  const [message, setMessage] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) {
      return trainers
    }

    return trainers.filter(
      (trainer) =>
        trainer.name.toLowerCase().includes(term) ||
        trainer.phone.toLowerCase().includes(term) ||
        trainer.specialty.toLowerCase().includes(term),
    )
  }, [trainers, search])

  function resetForm() {
    setName('')
    setPhone('')
    setSpecialty('')
    setEditingTrainer(null)
    setShowForm(false)
  }

  function openNewTrainerForm() {
    setName('')
    setPhone('')
    setSpecialty('')
    setEditingTrainer(null)
    setMessage('')
    setShowForm(true)
  }

  function openEditTrainer(trainer: Trainer) {
    setName(trainer.name)
    setPhone(trainer.phone)
    setSpecialty(trainer.specialty)
    setEditingTrainer(trainer)
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
      !specialty.trim()
    ) {
      return
    }

    if (editingTrainer) {
      setTrainers((current) =>
        current.map((trainer) =>
          trainer.id === editingTrainer.id
            ? {
                ...trainer,
                name: name.trim(),
                phone: phone.trim(),
                specialty: specialty.trim(),
              }
            : trainer,
        ),
      )

      setMessage(
        'La información del entrenador fue actualizada correctamente.',
      )

      resetForm()
      return
    }

    const trainer: Trainer = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      specialty: specialty.trim(),
      active: true,
    }

    setTrainers((current) => [
      trainer,
      ...current,
    ])

    setMessage(
      'Entrenador registrado correctamente.',
    )

    resetForm()
  }

  function toggleTrainer(id: number) {
    setTrainers((current) =>
      current.map((trainer) =>
        trainer.id === id
          ? {
              ...trainer,
              active: !trainer.active,
            }
          : trainer,
      ),
    )
  }

  function deleteTrainer() {
    if (!trainerToDelete) {
      return
    }

    setTrainers((current) =>
      current.filter(
        (trainer) =>
          trainer.id !== trainerToDelete.id,
      ),
    )

    setMessage(
      `${trainerToDelete.name} fue eliminado de la demostración.`,
    )

    setTrainerToDelete(null)
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Personal
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Entrenadores
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Administra los entrenadores del gimnasio.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewTrainerForm}
          className="h-11 rounded-xl bg-[#E11D2E] px-5 text-sm font-semibold text-white hover:bg-[#C91828]"
        >
          + Nuevo entrenador
        </button>
      </div>

      {message && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage('')}
            className="font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">
                {editingTrainer
                  ? 'Editar entrenador'
                  : 'Registrar entrenador'}
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                {editingTrainer
                  ? 'Actualiza la información del entrenador.'
                  : 'Completa los datos del nuevo entrenador.'}
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
                  setName(event.target.value)
                }
                required
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
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
                  setPhone(event.target.value)
                }
                required
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Especialidad *
              </label>

              <input
                type="text"
                value={specialty}
                onChange={(event) =>
                  setSpecialty(event.target.value)
                }
                required
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="h-11 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-600"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="h-11 rounded-xl bg-[#E11D2E] px-5 text-sm font-semibold text-white"
            >
              {editingTrainer
                ? 'Guardar cambios'
                : 'Guardar entrenador'}
            </button>
          </div>
        </form>
      )}

      {trainerToDelete && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-semibold text-red-700">
            ¿Eliminar entrenador?
          </h3>

          <p className="mt-2 text-sm text-zinc-700">
            Se eliminará a{' '}
            <strong>{trainerToDelete.name}</strong>.
          </p>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                setTrainerToDelete(null)
              }
              className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-600"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={deleteTrainer}
              className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-5">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Buscar nombre, teléfono o especialidad..."
            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-4">
                  Entrenador
                </th>

                <th className="px-5 py-4">
                  Teléfono
                </th>

                <th className="px-5 py-4">
                  Especialidad
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
              {filtered.map((trainer) => (
                <tr
                  key={trainer.id}
                  className="hover:bg-zinc-50"
                >
                  <td className="px-5 py-4 font-semibold">
                    {trainer.name}
                  </td>

                  <td className="px-5 py-4">
                    {trainer.phone}
                  </td>

                  <td className="px-5 py-4">
                    {trainer.specialty}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        trainer.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {trainer.active
                        ? 'Activo'
                        : 'Inactivo'}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          openEditTrainer(trainer)
                        }
                        className="text-xs font-semibold text-zinc-700 hover:text-[#E11D2E]"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleTrainer(trainer.id)
                        }
                        className="text-xs font-semibold text-[#E11D2E]"
                      >
                        {trainer.active
                          ? 'Desactivar'
                          : 'Activar'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setTrainerToDelete(trainer)
                        }
                        className="text-xs font-semibold text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-zinc-500"
                  >
                    No se encontraron entrenadores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
