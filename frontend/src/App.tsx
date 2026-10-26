import { useEffect, useState } from 'react'

import AppLayout from './components/layout/AppLayout'
import type { AppPage } from './components/layout/Sidebar'

import LoginPage, {
  convertirSesion,
} from './features/auth/LoginPage'
import type { AuthUser } from './features/auth/LoginPage'

import {
  cerrarSesion,
  obtenerSesion,
} from './services/auth'

import DashboardPage from './features/dashboard/DashboardPage'
import MembersPage from './features/members/MembersPage'
import MembershipsPage from './features/memberships/MembershipsPage'
import CheckInPage from './features/checkin/CheckInPage'
import AttendancePage from './features/attendance/AttendancePage'
import PaymentsPage from './features/payments/PaymentsPage'
import DailyEntriesPage from './features/dailyEntries/DailyEntriesPage'
import ExpensesPage from './features/expenses/ExpensesPage'
import DailyClosePage from './features/dailyClose/DailyClosePage'
import EmployeesPage from './features/employees/EmployeesPage'
import TrainersPage from './features/trainers/TrainersPage'
import ClassesPage from './features/classes/ClassesPage'
import AnalyticsPage from './features/analytics/AnalyticsPage'

function App() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [activePage, setActivePage] =
    useState<AppPage>('dashboard')

  const [cargando, setCargando] = useState(true)
  const [cerrando, setCerrando] = useState(false)
  const [errorSesion, setErrorSesion] = useState('')

  useEffect(() => {
    let activo = true

    async function recuperarSesion() {
      try {
        const sesion = await obtenerSesion()

        if (activo) {
          setUser(sesion ? convertirSesion(sesion) : null)
        }
      } catch (error) {
        if (activo) {
          setErrorSesion(
            error instanceof Error
              ? error.message
              : 'No se pudo comprobar la sesión.',
          )
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    void recuperarSesion()

    return () => {
      activo = false
    }
  }, [])

  function handleLogin(authenticatedUser: AuthUser) {
    setUser(authenticatedUser)
    setErrorSesion('')
    setActivePage('dashboard')
  }

  async function handleLogout() {
    if (cerrando) {
      return
    }

    setCerrando(true)
    setErrorSesion('')

    try {
      // Si la sesión ya venció, basta con limpiar la interfaz.
      const sesion = await obtenerSesion()

      if (sesion) {
        await cerrarSesion()
      }

      setUser(null)
      setActivePage('dashboard')
    } catch (error) {
      setErrorSesion(
        error instanceof Error
          ? error.message
          : 'No se pudo cerrar sesión.',
      )
    } finally {
      setCerrando(false)
    }
  }

  function handleNavigate(page: AppPage) {
    if (!user || cerrando) {
      return
    }

    const adminOnlyPages: AppPage[] = [
      'expenses',
      'dailyClose',
      'employees',
      'trainers',
      'classes',
      'analytics',
    ]

    if (
      user.role !== 'Administrador' &&
      adminOnlyPages.includes(page)
    ) {
      return
    }

    setActivePage(page)
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Comprobando sesión…
      </main>
    )
  }

  if (!user && errorSesion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="max-w-md text-center">
          <p role="alert">{errorSesion}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-red-600 px-5 py-3"
          >
            Volver a comprobar
          </button>
        </div>
      </main>
    )
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <>
      <AppLayout
        activePage={activePage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={() => {
          void handleLogout()
        }}
      >
        {errorSesion && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {errorSesion}
          </div>
        )}

        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'members' && <MembersPage />}
        {activePage === 'memberships' && <MembershipsPage />}
        {activePage === 'checkin' && <CheckInPage />}
        {activePage === 'attendance' && <AttendancePage />}
        {activePage === 'payments' && <PaymentsPage />}
        {activePage === 'dailyEntries' && <DailyEntriesPage />}
        {activePage === 'expenses' && <ExpensesPage />}
        {activePage === 'dailyClose' && <DailyClosePage />}
        {activePage === 'employees' && <EmployeesPage />}
        {activePage === 'trainers' && <TrainersPage />}
        {activePage === 'classes' && <ClassesPage />}
        {activePage === 'analytics' && <AnalyticsPage />}
      </AppLayout>

      {cerrando && (
        <div
          role="status"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 text-white"
        >
          Cerrando sesión…
        </div>
      )}
    </>
  )
}

export default App