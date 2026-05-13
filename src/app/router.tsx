/* eslint-disable react-refresh/only-export-components -- route table + lazy chunks, not a component module */
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { MainLayout } from '@/components/layout/MainLayout'
import { AdminRoute } from '@/pages/admin/AdminRoute'

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const SearchPage = lazy(() => import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })))
const UnitQuestionPage = lazy(() =>
  import('@/pages/UnitQuestionPage').then((m) => ({ default: m.UnitQuestionPage })),
)
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })))
const LoginGatePage = lazy(() => import('@/pages/LoginGatePage').then((m) => ({ default: m.LoginGatePage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const HelpCenterPage = lazy(() => import('@/pages/HelpCenterPage').then((m) => ({ default: m.HelpCenterPage })))
const SiteRatingsPage = lazy(() => import('@/pages/SiteRatingsPage').then((m) => ({ default: m.SiteRatingsPage })))
const PrivacyPolicyPage = lazy(() =>
  import('@/pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })),
)
const TermsOfServicePage = lazy(() =>
  import('@/pages/TermsOfServicePage').then((m) => ({ default: m.TermsOfServicePage })),
)
const DisclaimerPage = lazy(() => import('@/pages/DisclaimerPage').then((m) => ({ default: m.DisclaimerPage })))
const BlogIndexPage = lazy(() => import('@/pages/BlogIndexPage').then((m) => ({ default: m.BlogIndexPage })))
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })))

const AdminLayout = lazy(() =>
  import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const AdminHomeLayoutPage = lazy(() =>
  import('@/pages/admin/AdminHomeLayoutPage').then((m) => ({ default: m.AdminHomeLayoutPage })),
)
const AdminRegulationsPage = lazy(() =>
  import('@/pages/admin/AdminRegulationsPage').then((m) => ({ default: m.AdminRegulationsPage })),
)
const AdminQuestionCreatePage = lazy(() =>
  import('@/pages/admin/AdminQuestionEditorPage').then((m) => ({ default: m.AdminQuestionCreatePage })),
)
const AdminQuestionEditPage = lazy(() =>
  import('@/pages/admin/AdminQuestionEditorPage').then((m) => ({ default: m.AdminQuestionEditPage })),
)
const AdminQuestionsPage = lazy(() =>
  import('@/pages/admin/AdminQuestionsPage').then((m) => ({ default: m.AdminQuestionsPage })),
)
const AdminSubjectsPage = lazy(() =>
  import('@/pages/admin/AdminSubjectsPage').then((m) => ({ default: m.AdminSubjectsPage })),
)
const AdminBranchesPage = lazy(() =>
  import('@/pages/admin/AdminBranchesPage').then((m) => ({ default: m.AdminBranchesPage })),
)
const AdminCommentsPage = lazy(() =>
  import('@/pages/admin/AdminCommentsPage').then((m) => ({ default: m.AdminCommentsPage })),
)
const AdminFeedbackPage = lazy(() =>
  import('@/pages/admin/AdminFeedbackPage').then((m) => ({ default: m.AdminFeedbackPage })),
)
const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
)
const AdminAnalyticsPage = lazy(() =>
  import('@/pages/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })),
)
const AdminSEOPage = lazy(() => import('@/pages/admin/AdminSEOPage').then((m) => ({ default: m.AdminSEOPage })))
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })),
)
const AdminBackupPage = lazy(() =>
  import('@/pages/admin/AdminBackupPage').then((m) => ({ default: m.AdminBackupPage })),
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
          { path: 'ratings', element: <SiteRatingsPage /> },
          { path: 'help', element: <HelpCenterPage /> },
          { path: 'privacy', element: <PrivacyPolicyPage /> },
          { path: 'terms', element: <TermsOfServicePage /> },
          { path: 'disclaimer', element: <DisclaimerPage /> },
          { path: 'blog', element: <BlogIndexPage /> },
          { path: 'blog/:slug', element: <BlogPostPage /> },
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
