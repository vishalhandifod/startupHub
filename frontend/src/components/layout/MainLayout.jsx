import { Outlet } from 'react-router-dom'
import { useToast } from '../common/Toast.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { NotificationContext } from '../../contexts/NotificationContext.jsx'
import { useContext, useState } from 'react'
import { toggleTheme } from '../../utils/theme.js'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import MobileTabBar from './MobileTabBar.jsx'
import CreatePostModal from '../post/CreatePostModal.jsx'

export default function MainLayout() {
  const { currentUser, logout, theme, setTheme } = useAuth()
  const { unreadCount } = useContext(NotificationContext)
  const [createOpen, setCreateOpen] = useState(false)
  const { showToast } = useToast()

  function handleLogout() {
    logout()
    showToast({
      title: 'Signed out',
      message: 'Your StartupHub session has been closed.',
      tone: 'success',
    })
  }

  function handleThemeToggle() {
    setTheme(toggleTheme(theme))
  }

  return (
    <div className="app-shell">
      <Sidebar
        currentUser={currentUser}
        onCreatePost={() => setCreateOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleThemeToggle}
        unreadCount={unreadCount}
      />
      <div className="lg:pl-[280px]">
        <TopBar unreadCount={unreadCount} />
        <main className="min-h-screen px-4 pb-28 pt-6 md:px-6 lg:px-8 lg:pb-10">
          <Outlet context={{ openCreatePost: () => setCreateOpen(true) }} />
        </main>
      </div>
      <MobileTabBar onCreatePost={() => setCreateOpen(true)} unreadCount={unreadCount} />
      <CreatePostModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
