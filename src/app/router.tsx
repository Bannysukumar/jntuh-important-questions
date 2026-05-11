import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { MainLayout } from '@/components/layout/MainLayout'
import { HomePage } from '@/pages/HomePage'
import { SearchPage } from '@/pages/SearchPage'
import { UnitQuestionPage } from '@/pages/UnitQuestionPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { LoginGatePage } from '@/pages/LoginGatePage'
import { ProfilePage } from '@/pages/ProfilePage'
import { AboutPage } from '@/pages/AboutPage'
import { HelpCenterPage } from '@/pages/HelpCenterPage'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage'
import { TermsOfServicePage } from '@/pages/TermsOfServicePage'
import { DisclaimerPage } from '@/pages/DisclaimerPage'
import { AdminRoute } from '@/pages/admin/AdminRoute'
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage'
import { AdminBackupPage } from '@/pages/admin/AdminBackupPage'
import { AdminBranchesPage } from '@/pages/admin/AdminBranchesPage'
import { AdminCommentsPage } from '@/pages/admin/AdminCommentsPage'
import { AdminFeedbackPage } from '@/pages/admin/AdminFeedbackPage'
import { AdminHomeLayoutPage } from '@/pages/admin/AdminHomeLayoutPage'
import { AdminRegulationsPage } from '@/pages/admin/AdminRegulationsPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminQuestionCreatePage, AdminQuestionEditPage } from '@/pages/admin/AdminQuestionEditorPage'
import { AdminQuestionsPage } from '@/pages/admin/AdminQuestionsPage'
import { AdminSEOPage } from '@/pages/admin/AdminSEOPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'
import { AdminSubjectsPage } from '@/pages/admin/AdminSubjectsPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'

const AdminLayout = lazy(() =>
  import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)

function AdminFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#070a12] text-sm text-slate-400">
      Loading admin console…
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'search', element: <SearchPage /> },
          {
            path: ':regulation/:branch/:semester/:subjectSlug/:unitSlug',
            element: <UnitQuestionPage />,
          },
          { path: 'favorites', element: <FavoritesPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'about', element: <AboutPage /> },
          { path: 'help', element: <HelpCenterPage /> },
          { path: 'privacy', element: <PrivacyPolicyPage /> },
          { path: 'terms', element: <TermsOfServicePage /> },
          { path: 'disclaimer', element: <DisclaimerPage /> },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
      { path: '/login', element: <LoginGatePage /> },
      {
        path: '/admin',
        element: (
          <Suspense fallback={<AdminFallback />}>
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          </Suspense>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'home', element: <AdminHomeLayoutPage /> },
          { path: 'regulations', element: <AdminRegulationsPage /> },
          { path: 'questions/new', element: <AdminQuestionCreatePage /> },
          { path: 'questions/:id/edit', element: <AdminQuestionEditPage /> },
          { path: 'questions', element: <AdminQuestionsPage /> },
          { path: 'subjects', element: <AdminSubjectsPage /> },
          { path: 'branches', element: <AdminBranchesPage /> },
          { path: 'comments', element: <AdminCommentsPage /> },
          { path: 'feedback', element: <AdminFeedbackPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'analytics', element: <AdminAnalyticsPage /> },
          { path: 'seo', element: <AdminSEOPage /> },
          { path: 'settings', element: <AdminSettingsPage /> },
          { path: 'backup', element: <AdminBackupPage /> },
          { path: '*', element: <Navigate to="/admin" replace /> },
        ],
      },
    ],
  },
])
