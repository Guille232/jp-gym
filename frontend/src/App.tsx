import { useState } from 'react'

import AppLayout from './components/layout/AppLayout'

import type { AppPage } from './components/layout/Sidebar'

import LoginPage from './features/auth/LoginPage'

import type {
  AuthUser,
} from './features/auth/LoginPage'

import DashboardPage from './features/dashboard/DashboardPage'
import MembersPage from './features/members/MembersPage'
import MembershipsPage from './features/memberships/MembershipsPage'
import CheckInPage from './features/checkin/CheckInPage'
import AttendancePage from './features/attendance/AttendancePage'
import PaymentsPage from './features/payments/PaymentsPage'
import DailyEntriesPage from './features/dailyEntries/DailyEntriesPage'
import ExpensesPage from './features/expenses/ExpensesPage'
import EmployeesPage from './features/employees/EmployeesPage'
import TrainersPage from './features/trainers/TrainersPage'
import ClassesPage from './features/classes/ClassesPage'
import AnalyticsPage from './features/analytics/AnalyticsPage'

function App() {
  const [user, setUser] =
    useState<AuthUser | null>(null)

  const [activePage, setActivePage] =
    useState<AppPage>('dashboard')

  function handleLogin(
    authenticatedUser: AuthUser,
  ) {
    setUser(authenticatedUser)
    setActivePage('dashboard')
  }

  function handleLogout() {
    setUser(null)
    setActivePage('dashboard')
  }

  function handleNavigate(
    page: AppPage,
  ) {
    if (!user) {
      return
    }

    const adminOnlyPages: AppPage[] = [
      'expenses',
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

  if (!user) {
    return (
      <LoginPage
        onLogin={handleLogin}
      />
    )
  }

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      {activePage === 'dashboard' && (
        <DashboardPage />
      )}

      {activePage === 'members' && (
        <MembersPage />
      )}

      {activePage === 'memberships' && (
        <MembershipsPage />
      )}

      {activePage === 'checkin' && (
        <CheckInPage />
      )}

      {activePage === 'attendance' && (
        <AttendancePage />
      )}

      {activePage === 'payments' && (
        <PaymentsPage />
      )}

      {activePage === 'dailyEntries' && (
        <DailyEntriesPage />
      )}

      {activePage === 'expenses' && (
        <ExpensesPage />
      )}

      {activePage === 'employees' && (
        <EmployeesPage />
      )}

      {activePage === 'trainers' && (
        <TrainersPage />
      )}

      {activePage === 'classes' && (
        <ClassesPage />
      )}

      {activePage === 'analytics' && (
        <AnalyticsPage />
      )}
    </AppLayout>
  )
}

export default App
