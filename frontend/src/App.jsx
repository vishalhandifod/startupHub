import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout.jsx'
import PageErrorBoundary from './components/common/PageErrorBoundary.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import { useAuth } from './hooks/useAuth.js'
import DiscoverPage from './pages/DiscoverPage.jsx'
import FeedPage from './pages/FeedPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MessagesPage from './pages/MessagesPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import StartupDetailPage from './pages/StartupDetailPage.jsx'
import StartupsPage from './pages/StartupsPage.jsx'

function RootRedirect() {
  const { token } = useAuth()
  return <Navigate to={token ? '/feed' : '/login'} replace />
}

function App() {
  const wrap = (element) => <PageErrorBoundary>{element}</PageErrorBoundary>

  return (
    <Routes>
      <Route path="/" element={wrap(<RootRedirect />)} />
      <Route path="/login" element={wrap(<LoginPage />)} />
      <Route path="/register" element={wrap(<RegisterPage />)} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/feed" element={wrap(<FeedPage />)} />
        <Route path="/discover" element={wrap(<DiscoverPage />)} />
        <Route path="/profile/me" element={wrap(<ProfilePage />)} />
        <Route path="/profile/:userId" element={wrap(<ProfilePage />)} />
        <Route path="/startups" element={wrap(<StartupsPage />)} />
        <Route path="/startups/:id" element={wrap(<StartupDetailPage />)} />
        <Route path="/messages" element={wrap(<MessagesPage />)} />
        <Route path="/notifications" element={wrap(<NotificationsPage />)} />
      </Route>

      <Route path="*" element={wrap(<Navigate to="/" replace />)} />
    </Routes>
  )
}

export default App
