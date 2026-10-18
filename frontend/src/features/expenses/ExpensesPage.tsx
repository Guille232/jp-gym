import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type Expense = {
  id: number
  category: string
  concept: string
  amount: number
  date: string
  observation: string
}

const initialExpenses: Expense[] = [
  {
    id: 1,
    category: 'Servicios',
    concept: 'Energía eléctrica',
    amount: 18500,
    date: '2026-10-03',
    observation: 'Factura del mes',
  },
  {
    id: 2,
    category: 'Mantenimiento',
    concept: 'Reparación de caminadora',
    amount: 4500,
    date: '2026-10-02',
    observation: '',
  },
  {
    id: 3,
    category: 'Limpieza',
    concept: 'Productos de limpieza',
    amount: 2800,
    date: '2026-10-01',
    observation: '',
  },
]

export default function ExpensesPage() {
  const [expenses, setExpenses] =
    useState<Expense[]>(initialExpenses)

  const [showForm, setShowForm] =
    useState(false)

  const [category, setCategory] =
    useState('')

  const [concept, setConcept] =
    useState('')

  const [amount, setAmount] =
    useState('')

  const [date, setDate] =
    useState('2026-10-05')

  const [observation, setObservation] =
    useState('')

  const [search, setSearch] =
    useState('')

  const filtered = useMemo(() => {
    const term =
      search.trim().toLowerCase()

    if (!term) {
      return expenses
    }

    return expenses.filter(
      (expense) =>
        expense.category
          .toLowerCase()
          .includes(term) ||
        expense.concept
          .toLowerCase()
          .includes(term),
    )
  }, [expenses, search])

  const total = filtered.reduce(
    (sum, expense) =>
      sum + expense.amount,
    0,
  )

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const numericAmount =
      Number(amount)

    if (
      !category ||
      !concept.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !date
    ) {
      return
    }

    const expense: Expense = {
      id: Date.now(),
      category,
      concept: concept.trim(),
      amount: numericAmount,
      date,
      observation:
        observation.trim(),
    }

    setExpenses((current) => [
      expense,
      ...current,
    ])

    setCategory('')
    setConcept('')
    setAmount('')
    setObservation('')
    setShowForm(false)
  }

  function deleteExpense(id: number) {
    setExpenses((current) =>
      current.filter(
        (expense) =>
          expense.id !== id,
      ),
    )
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Administración
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Gastos
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Registra y consulta los gastos operativos de JP GYM.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm(
              (current) => !current,
            )
          }
          className="h-11 rounded-xl bg-[#E11D2E] px-5 text-sm font-semibold text-white"
        >
          {showForm
            ? 'Cerrar formulario'
            : '+ Registrar gasto'}
        </button>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-zinc-500">
            Gastos registrados
          </p>

          <p className="mt-2 text-3xl font-bold">
            {filtered.length}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-zinc-500">
            Total mostrado
          </p>

          <p className="mt-2 text-3xl font-bold">
            RD$
            {total.toLocaleString(
              'es-DO',
              {
                minimumFractionDigits: 2,
              },
            )}
          </p>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="font-semibold">
            Registrar nuevo gasto
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Categoría *
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value,
                  )
                }
                required
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
              >
                <option value="">
                  Selecciona
                </option>

                <option value="Servicios">
                  Servicios
                </option>

                <option value="Mantenimiento">
                  Mantenimiento
                </option>

                <option value="Limpieza">
                  Limpieza
                </option>

                <option value="Alquiler">
                  Alquiler
                </option>

                <option value="Equipos">
                  Equipos
                </option>

                <option value="Otros">
                  Otros
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Concepto *
              </label>

              <input
                type="text"
                value={concept}
                onChange={(event) =>
                  setConcept(
                    event.target.value,
                  )
                }
                required
                placeholder="Ej. Pago de electricidad"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Monto *
              </label>

              <div className="relative">
                <span className="absolute left-4 top-3 text-sm text-zinc-500">
                  RD$
                </span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value,
                    )
                  }
                  required
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-sm outline-none focus:border-[#E11D2E]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Fecha *
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value,
                  )
                }
                required
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold text-zinc-600">
                Observación
              </label>

              <textarea
                value={observation}
                onChange={(event) =>
                  setObservation(
                    event.target.value,
                  )
                }
                rows={3}
                placeholder="Opcional"
                className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-[#E11D2E]"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="h-11 rounded-xl bg-[#E11D2E] px-5 text-sm font-semibold text-white"
            >
              Guardar gasto
            </button>
          </div>
        </form>
      )}

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
            placeholder="Buscar categoría o concepto..."
            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-4">
                  Fecha
                </th>

                <th className="px-5 py-4">
                  Categoría
                </th>

                <th className="px-5 py-4">
                  Concepto
                </th>

                <th className="px-5 py-4">
                  Observación
                </th>

                <th className="px-5 py-4 text-right">
                  Monto
                </th>

                <th className="px-5 py-4 text-right">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {filtered.map(
                (expense) => (
                  <tr key={expense.id}>
                    <td className="px-5 py-4">
                      {expense.date}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs">
                        {expense.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {expense.concept}
                    </td>

                    <td className="px-5 py-4 text-zinc-500">
                      {expense.observation ||
                        '—'}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold">
                      RD$
                      {expense.amount.toLocaleString(
                        'es-DO',
                        {
                          minimumFractionDigits: 2,
                        },
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          deleteExpense(
                            expense.id,
                          )
                        }
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
