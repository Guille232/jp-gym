import { useRef, useState } from 'react'

type ExcelMode =
  | 'import'
  | 'export'

export type MemberExcelRow = {
  code: string
  name: string
  phone: string
  cedula: string
  age: number
  address: string
  status: string
}

type MemberExcelPanelProps = {
  mode: ExcelMode
  members: MemberExcelRow[]
  onClose: () => void
}

export default function MemberExcelPanel({
  mode,
  members,
  onClose,
}: MemberExcelPanelProps) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null)

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [error, setError] =
    useState('')

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    const fileName =
      file.name.toLowerCase()

    const valid =
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls')

    if (!valid) {
      setSelectedFile(null)

      setError(
        'Selecciona un archivo Excel válido (.xlsx o .xls).',
      )

      return
    }

    setSelectedFile(file)
    setError('')
  }

  function clearFile() {
    setSelectedFile(null)
    setError('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D2E]">
            Excel
          </p>

          <h2 className="mt-2 text-xl font-bold text-zinc-900">
            {mode === 'import'
              ? 'Importar miembros'
              : 'Exportar miembros'}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            {mode === 'import'
              ? 'Prepara los datos históricos del gimnasio para incorporarlos al sistema.'
              : 'Prepara una exportación de los datos registrados en JP GYM.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50"
        >
          ✕
        </button>
      </div>

      {mode === 'import' ? (
        <ImportSection
          selectedFile={selectedFile}
          error={error}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onClear={clearFile}
        />
      ) : (
        <ExportSection
          members={members}
        />
      )}
    </section>
  )
}

type ImportSectionProps = {
  selectedFile: File | null
  error: string
  fileInputRef:
    React.RefObject<HTMLInputElement | null>
  onFileChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void
  onClear: () => void
}

function ImportSection({
  selectedFile,
  error,
  fileInputRef,
  onFileChange,
  onClear,
}: ImportSectionProps) {
  return (
    <div className="p-5 sm:p-6">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-900">
          Migración de datos anteriores
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-800">
          Esta función permitirá al dueño cargar los miembros que tenía antes
          de utilizar JP GYM, sin tener que registrarlos uno por uno.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-zinc-900">
          Estructura base del archivo
        </h3>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          La estructura definitiva será validada con el backend antes de
          habilitar la importación real.
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-200">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-zinc-50 text-[10px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3">
                  Nombre
                </th>

                <th className="px-4 py-3">
                  Teléfono
                </th>

                <th className="px-4 py-3">
                  Documento
                </th>

                <th className="px-4 py-3">
                  Edad
                </th>

                <th className="px-4 py-3">
                  Dirección
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t border-zinc-100 text-zinc-500">
                <td className="px-4 py-4">
                  Juan Pérez
                </td>

                <td className="px-4 py-4">
                  809-555-0000
                </td>

                <td className="px-4 py-4">
                  001-0000000-0
                </td>

                <td className="px-4 py-4">
                  25
                </td>

                <td className="px-4 py-4">
                  Santo Domingo
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[11px] text-zinc-400">
          El código JP del miembro no debe escribirse manualmente; será
          asignado por el sistema durante la importación.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={onFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() =>
          fileInputRef.current?.click()
        }
        className="mt-6 flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center transition hover:border-zinc-300 hover:bg-zinc-100"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5 text-zinc-500"
          >
            <path d="M12 16V4" />
            <path d="M7 9l5-5 5 5" />
            <path d="M5 20h14" />
          </svg>
        </div>

        <p className="mt-4 text-sm font-semibold text-zinc-800">
          Seleccionar archivo Excel
        </p>

        <p className="mt-1 text-xs text-zinc-400">
          Formatos permitidos: .xlsx y .xls
        </p>
      </button>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {selectedFile && (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Archivo seleccionado
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-zinc-900">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {formatBytes(
                  selectedFile.size,
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={onClear}
              className="text-xs font-semibold text-red-600"
            >
              Quitar archivo
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled
          title="Pendiente de backend"
          className="h-11 cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100 px-5 text-sm font-semibold text-zinc-400"
        >
          Descargar plantilla · Próximamente
        </button>

        <button
          type="button"
          disabled={!selectedFile}
          title="La importación real se conectará al backend"
          className={`h-11 rounded-xl px-5 text-sm font-semibold ${
            selectedFile
              ? 'cursor-not-allowed bg-zinc-300 text-zinc-500'
              : 'cursor-not-allowed bg-zinc-100 text-zinc-400'
          }`}
        >
          Procesar importación
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold text-amber-900">
          Antes de importar
        </p>

        <p className="mt-1 text-xs leading-5 text-amber-800">
          El backend deberá validar duplicados, registros incorrectos y
          asignar los códigos permanentes de los miembros antes de guardar la
          información.
        </p>
      </div>
    </div>
  )
}

function ExportSection({
  members,
}: {
  members: MemberExcelRow[]
}) {
  const activeMembers =
    members.filter(
      (member) =>
        member.status === 'Activo',
    ).length

  const withoutMembership =
    members.filter(
      (member) =>
        member.status ===
        'Sin membresía',
    ).length

  return (
    <div className="p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ExportMetric
          label="Miembros"
          value={members.length}
        />

        <ExportMetric
          label="Activos"
          value={activeMembers}
        />

        <ExportMetric
          label="Sin membresía"
          value={withoutMembership}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 p-5">
        <h3 className="text-sm font-bold text-zinc-900">
          Exportación de datos
        </h3>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Esta opción permitirá descargar los datos de los miembros registrados
          para respaldo, revisión o traslado de información.
        </p>

        <div className="mt-5 space-y-3">
          <ExportField text="Código del miembro" />
          <ExportField text="Nombre completo" />
          <ExportField text="Teléfono" />
          <ExportField text="Cédula / Documento" />
          <ExportField text="Edad" />
          <ExportField text="Dirección" />
          <ExportField text="Estado de membresía" />
        </div>
      </div>

      <button
        type="button"
        disabled
        title="Pendiente de backend"
        className="mt-6 h-11 w-full cursor-not-allowed rounded-xl bg-zinc-200 px-5 text-sm font-semibold text-zinc-500"
      >
        Exportar miembros a Excel · Próximamente
      </button>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold text-amber-900">
          Exportación pendiente de conexión
        </p>

        <p className="mt-1 text-xs leading-5 text-amber-800">
          Guillermo deberá entregar el archivo o endpoint de exportación antes
          de activar este botón.
        </p>
      </div>
    </div>
  )
}

function ExportMetric({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-zinc-900">
        {value}
      </p>
    </div>
  )
}

function ExportField({
  text,
}: {
  text: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="size-2 rounded-full bg-emerald-500" />

      <p className="text-sm text-zinc-600">
        {text}
      </p>
    </div>
  )
}

function formatBytes(
  bytes: number,
) {
  if (bytes === 0) {
    return '0 B'
  }

  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`
}
