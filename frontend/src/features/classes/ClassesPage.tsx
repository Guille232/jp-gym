import { useState } from 'react'
import type { FormEvent } from 'react'

type GymClass = {
  id: number
  name: string
  trainer: string
  day: string
  time: string
  capacity: number
  active: boolean
}

const initialClasses: GymClass[] = [
  {
    id: 1,
    name: 'Entrenamiento funcional',
    trainer: 'Laura Hernández',
    day: 'Lunes',
    time: '18:00',
    capacity: 15,
    active: true,
  },
  {
    id: 2,
    name: 'Fuerza básica',
    trainer: 'Rafael Gómez',
    day: 'Miércoles',
    time: '19:00',
    capacity: 12,
    active: true,
  },
]

export default function ClassesPage() {
  const [classes, setClasses] =
    useState<GymClass[]>(initialClasses)

  const [showForm, setShowForm] =
    useState(false)

  const [editingClass, setEditingClass] =
    useState<GymClass | null>(null)

  const [classToDelete, setClassToDelete] =
    useState<GymClass | null>(null)

  const [name, setName] = useState('')
  const [trainer, setTrainer] = useState('')
  const [day, setDay] = useState('')
  const [time, setTime] = useState('')
  const [capacity, setCapacity] = useState('')

  const [message, setMessage] = useState('')

  function resetForm() {
    setName('')
    setTrainer('')
    setDay('')
    setTime('')
    setCapacity('')
    setEditingClass(null)
    setShowForm(false)
  }

  function openNewClassForm() {
    resetForm()
    setMessage('')
    setShowForm(true)
  }

  function openEditClass(
    gymClass: GymClass,
  ) {
    setEditingClass(gymClass)

    setName(gymClass.name)
    setTrainer(gymClass.trainer)
    setDay(gymClass.day)
    setTime(gymClass.time)
    setCapacity(
      String(gymClass.capacity),
    )

    setMessage('')
    setShowForm(true)
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const numericCapacity =
      Number(capacity)

    if (
      !name.trim() ||
      !trainer.trim() ||
      !day ||
      !time ||
      !Number.isFinite(
        numericCapacity,
      ) ||
      numericCapacity < 1
    ) {
      return
    }

    if (editingClass) {
      setClasses((current) =>
        current.map((gymClass) =>
          gymClass.id ===
          editingClass.id
            ? {
                ...gymClass,
                name: name.trim(),
                trainer:
                  trainer.trim(),
                day,
                time,
                capacity:
                  numericCapacity,
              }
            : gymClass,
        ),
      )

      setMessage(
        'La clase fue actualizada correctamente.',
      )

      resetForm()
      return
    }

    const newClass: GymClass = {
      id: Date.now(),
      name: name.trim(),
      trainer: trainer.trim(),
      day,
      time,
      capacity: numericCapacity,
      active: true,
    }

    setClasses((current) => [
      newClass,
      ...current,
    ])

    setMessage(
      'Clase registrada correctamente.',
    )

    resetForm()
  }

  function toggleClass(id: number) {
    setClasses((current) =>
      current.map((gymClass) =>
        gymClass.id === id
          ? {
              ...gymClass,
              active:
                !gymClass.active,
            }
          : gymClass,
      ),
    )
  }

  function deleteClass() {
    if (!classToDelete) {
      return
    }

    setClasses((current) =>
      current.filter(
        (gymClass) =>
          gymClass.id !==
          classToDelete.id,
      ),
    )

    setMessage(
      `${classToDelete.name} fue eliminada de la demostración.`,
    )

    setClassToDelete(null)
  }

  function formatTime(
    value: string,
  ) {
    const [hourText, minuteText] =
      value.split(':')

    const hour = Number(hourText)

    if (
      !Number.isFinite(hour) ||
      !minuteText
    ) {
      return value
    }

    const period =
      hour >= 12 ? 'PM' : 'AM'

    const formattedHour =
      hour % 12 || 12

    return `${String(
      formattedHour,
    ).padStart(
      2,
      '0',
    )}:${minuteText} ${period}`
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Actividades
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Clases
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Organiza las clases,
            entrenadores y horarios
            del gimnasio.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openNewClassForm
          }
          className="h-11 rounded-xl bg-[#E11D2E] px-5 text-sm font-semibold text-white hover:bg-[#C91828]"
        >
          + Nueva clase
        </button>
      </div>

      {message && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>
            {message}
          </span>

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

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">
                {editingClass
                  ? 'Editar clase'
                  : 'Registrar clase'}
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                {editingClass
                  ? 'Actualiza la información de la clase.'
                  : 'Completa los datos de la nueva clase.'}
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

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Clase *
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
                placeholder="Nombre"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Entrenador *
              </label>

              <input
                type="text"
                value={trainer}
                onChange={(event) =>
                  setTrainer(
                    event.target.value,
                  )
                }
                required
                placeholder="Entrenador"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Día *
              </label>

              <select
                value={day}
                onChange={(event) =>
                  setDay(
                    event.target.value,
                  )
                }
                required
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
              >
                <option value="">
                  Selecciona
                </option>

                <option value="Lunes">
                  Lunes
                </option>

                <option value="Martes">
                  Martes
                </option>

                <option value="Miércoles">
                  Miércoles
                </option>

                <option value="Jueves">
                  Jueves
                </option>

                <option value="Viernes">
                  Viernes
                </option>

                <option value="Sábado">
                  Sábado
                </option>

                <option value="Domingo">
                  Domingo
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Hora *
              </label>

              <input
                type="time"
                value={time}
                onChange={(event) =>
                  setTime(
                    event.target.value,
                  )
                }
                required
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Cupo *
              </label>

              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(event) =>
                  setCapacity(
                    event.target.value,
                  )
                }
                required
                placeholder="15"
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
              {editingClass
                ? 'Guardar cambios'
                : 'Guardar clase'}
            </button>
          </div>
        </form>
      )}

      {classToDelete && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-semibold text-red-700">
            ¿Eliminar clase?
          </h3>

          <p className="mt-2 text-sm text-zinc-700">
            Se eliminará{' '}
            <strong>
              {classToDelete.name}
            </strong>
            .
          </p>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                setClassToDelete(
                  null,
                )
              }
              className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-600"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={deleteClass}
              className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {classes.map((gymClass) => (
          <article
            key={gymClass.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">
                  {gymClass.name}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  {gymClass.trainer}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  gymClass.active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-zinc-100 text-zinc-500'
                }`}
              >
                {gymClass.active
                  ? 'Activa'
                  : 'Inactiva'}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <ClassInfo
                label="Día"
                value={gymClass.day}
              />

              <ClassInfo
                label="Hora"
                value={formatTime(
                  gymClass.time,
                )}
              />

              <ClassInfo
                label="Cupo"
                value={String(
                  gymClass.capacity,
                )}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-4 border-t border-zinc-100 pt-4">
              <button
                type="button"
                onClick={() =>
                  openEditClass(
                    gymClass,
                  )
                }
                className="text-xs font-semibold text-zinc-700 hover:text-[#E11D2E]"
              >
                Editar
              </button>

              <button
                type="button"
                onClick={() =>
                  toggleClass(
                    gymClass.id,
                  )
                }
                className="text-xs font-semibold text-[#E11D2E]"
              >
                {gymClass.active
                  ? 'Desactivar'
                  : 'Activar'}
              </button>

              <button
                type="button"
                onClick={() =>
                  setClassToDelete(
                    gymClass,
                  )
                }
                className="text-xs font-semibold text-red-600"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}

        {classes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 lg:col-span-2">
            No hay clases registradas.
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-zinc-400">
        Interfaz visual. Reservas y asistencia a clases se implementarán cuando sus reglas estén definidas.
      </p>
    </section>
  )
}

function ClassInfo({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3">
      <p className="text-[10px] text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>
    </div>
  )
}
