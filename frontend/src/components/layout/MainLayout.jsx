import { useContext, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getConversations } from '../../api/messages.js'
import { NotificationContext } from '../../contexts/NotificationContext.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import CreatePostModal from '../post/CreatePostModal.jsx'
import { useToast } from '../common/Toast.jsx'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default function MainLayout() {
  const { currentUser, logout } = useAuth()
  const { unreadCount } = useContext(NotificationContext)
  const [createOpen, setCreateOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let ignore = false

    async function loadUnreadMessages() {
      try {
        const conversations = await getConversations()
        if (!ignore) {
          const totalUnread = conversations.reduce((sum, item) => sum + (item.unreadCount || 0), 0)
          setUnreadMessageCount(totalUnread)
        }
      } catch {
        if (!ignore) {
          setUnreadMessageCount(0)
        }
      }
    }

    loadUnreadMessages()

    return () => {
      ignore = true
    }
  }, [location.pathname])

  function handleLogout() {
    logout()
    showToast({
      title: 'Signed out',
      message: 'Your StartupHub session has been closed.',
      tone: 'success',
    })
  }

  function handleNavigate(event, path) {
    if (event) {
      event.preventDefault()
    }
    navigate(path)
    setMobileSidebarOpen(false)
  }

  function isActive(path) {
    if (path === '/profile/me') {
      return location.pathname === '/profile/me' || location.pathname.startsWith('/profile/')
    }
    return location.pathname === path
  }

  const navItems = useMemo(() => [
    { href: '/feed', label: 'Feed', icon: <HomeIcon /> },
    { href: '/discover', label: 'Explore', icon: <SearchIcon /> },
    { href: '/notifications', label: 'Notifications', icon: <BellIcon />, badge: unreadCount },
    { href: '/messages', label: 'Messages', icon: <MessageIcon />, badge: unreadMessageCount },
  ], [unreadCount, unreadMessageCount])

  const mobileNavItems = useMemo(() => [
    { href: '/feed', label: 'Home', icon: <HomeIcon />, badge: 0 },
    { href: '/discover', label: 'Explore', icon: <SearchIcon />, badge: 0 },
    { href: '/notifications', label: 'Alerts', icon: <BellIcon />, badge: unreadCount },
    { href: '/profile/me', label: 'Profile', icon: <ProfileIcon />, badge: 0 },
  ], [unreadCount])

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --sh-sidebar-w: 260px;
          --sh-sidebar-collapsed-w: 68px;
          --sh-topbar-h: 58px;
          --sh-bg: #070b12;
          --sh-surface: #0c111c;
          --sh-surface2: #111827;
          --sh-border: rgba(255,255,255,0.07);
          --sh-border-hover: rgba(255,255,255,0.13);
          --sh-text-primary: #f1f5f9;
          --sh-text-secondary: rgba(255,255,255,0.45);
          --sh-text-muted: rgba(255,255,255,0.22);
          --sh-accent: #34d399;
          --sh-accent-dim: rgba(52,211,153,0.12);
          --sh-radius: 12px;
          --sh-radius-sm: 8px;
          --sh-transition: 0.22s cubic-bezier(0.4,0,0.2,1);
        }

        body { margin: 0; background: var(--sh-bg); color: var(--sh-text-primary); font-family: var(--font-sans); }
        .sh-shell { display: flex; min-height: 100vh; background: var(--sh-bg); position: relative; }
        .sh-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: var(--sh-sidebar-w);
          background: var(--sh-surface);
          border-right: 0.5px solid var(--sh-border);
          display: flex; flex-direction: column; z-index: 100;
          transition: width var(--sh-transition), transform var(--sh-transition);
          overflow: hidden;
        }
        .sh-sidebar.collapsed { width: var(--sh-sidebar-collapsed-w); }
        .sh-sidebar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--sh-accent), #6366f1, transparent);
          z-index: 1;
        }
        .sh-sidebar-glow {
          position: absolute;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 65%);
          top: -60px; left: -60px;
          pointer-events: none;
        }
        .sh-sidebar-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 16px 14px;
          border-bottom: 0.5px solid var(--sh-border);
          position: relative; z-index: 1; min-height: 64px; flex-shrink: 0;
        }
        .sh-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; overflow: hidden; white-space: nowrap;
        }
        .sh-logo-icon {
          width: 34px; height: 34px; flex-shrink: 0;
          border-radius: 9px;
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 16px rgba(52,211,153,0.3);
          color: #fff;
        }
        .sh-logo-text {
          font-family: var(--font-display);
          font-size: 16px; font-weight: 700;
          color: var(--sh-text-primary);
          letter-spacing: -0.01em;
          transition: opacity var(--sh-transition), width var(--sh-transition);
        }
        .sh-sidebar.collapsed .sh-logo-text { opacity: 0; width: 0; }
        .sh-collapse-btn {
          width: 28px; height: 28px; flex-shrink: 0;
          background: var(--sh-surface2);
          border: 0.5px solid var(--sh-border);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--sh-text-secondary);
          transition: background var(--sh-transition), color var(--sh-transition);
          outline: none;
        }
        .sh-collapse-btn:hover { background: rgba(255,255,255,0.08); color: var(--sh-text-primary); }
        .sh-user-card {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; margin: 10px 10px 0;
          background: var(--sh-accent-dim);
          border: 0.5px solid rgba(52,211,153,0.15);
          border-radius: var(--sh-radius);
          cursor: pointer; transition: background var(--sh-transition);
          overflow: hidden; flex-shrink: 0; text-decoration: none;
        }
        .sh-user-card:hover { background: rgba(52,211,153,0.17); }
        .sh-user-avatar {
          width: 34px; height: 34px; flex-shrink: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #34d399 0%, #6366f1 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 12px; font-weight: 700; color: #fff;
          position: relative;
        }
        .sh-user-avatar-online {
          position: absolute; bottom: 0; right: 0;
          width: 9px; height: 9px; border-radius: 50%;
          background: #34d399; border: 1.5px solid var(--sh-surface);
        }
        .sh-user-info { overflow: hidden; transition: opacity var(--sh-transition), width var(--sh-transition); white-space: nowrap; }
        .sh-sidebar.collapsed .sh-user-info { opacity: 0; width: 0; }
        .sh-user-name { font-size: 13px; font-weight: 500; color: var(--sh-text-primary); }
        .sh-nav {
          flex: 1; padding: 12px 10px;
          overflow-y: auto; overflow-x: hidden; scrollbar-width: none;
        }
        .sh-nav::-webkit-scrollbar { display: none; }
        .sh-nav-section-label {
          font-size: 11px; font-weight: 600;
          color: var(--sh-text-muted);
          letter-spacing: 0.09em; text-transform: uppercase;
          padding: 6px 8px 4px; white-space: nowrap;
          transition: opacity var(--sh-transition);
        }
        .sh-sidebar.collapsed .sh-nav-section-label { opacity: 0; }
        .sh-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: var(--sh-radius-sm);
          cursor: pointer; color: var(--sh-text-secondary);
          text-decoration: none;
          transition: background var(--sh-transition), color var(--sh-transition);
          position: relative; white-space: nowrap; overflow: hidden; margin-bottom: 1px; outline: none;
        }
        .sh-nav-item:hover { background: rgba(255,255,255,0.05); color: var(--sh-text-primary); }
        .sh-nav-item.active { background: var(--sh-accent-dim); color: var(--sh-accent); }
        .sh-nav-item.active::before {
          content: '';
          position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 2.5px; border-radius: 100px; background: var(--sh-accent);
        }
        .sh-nav-icon {
          width: 36px; height: 36px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 9px; background: transparent;
          transition: background var(--sh-transition);
        }
        .sh-nav-item:hover .sh-nav-icon,
        .sh-nav-item.active .sh-nav-icon { background: rgba(255,255,255,0.06); }
        .sh-nav-item.active .sh-nav-icon { background: var(--sh-accent-dim); }
        .sh-nav-label {
          font-size: 13.5px; font-weight: 400;
          transition: opacity var(--sh-transition); flex: 1;
        }
        .sh-sidebar.collapsed .sh-nav-label { opacity: 0; pointer-events: none; }
        .sh-nav-badge {
          min-width: 18px; height: 18px;
          border-radius: 100px; background: var(--sh-accent); color: #051a10;
          font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center;
          padding: 0 5px; flex-shrink: 0; font-family: var(--font-display);
          transition: opacity var(--sh-transition);
        }
        .sh-sidebar.collapsed .sh-nav-badge { opacity: 0; }
        .sh-create-btn {
          margin: 0 10px 6px; padding: 10px 16px;
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          border: none; border-radius: var(--sh-radius-sm);
          font-family: var(--font-display); font-size: 13.5px; font-weight: 700;
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: opacity 0.2s, box-shadow 0.2s, transform 0.15s;
          box-shadow: 0 3px 18px rgba(52,211,153,0.22);
          outline: none; overflow: hidden; white-space: nowrap; flex-shrink: 0;
        }
        .sh-create-btn:hover { opacity: 0.9; box-shadow: 0 6px 24px rgba(52,211,153,0.33); transform: translateY(-1px); }
        .sh-create-btn:active { transform: translateY(0); }
        .sh-create-btn-text { transition: opacity var(--sh-transition); }
        .sh-sidebar.collapsed .sh-create-btn-text { opacity: 0; width: 0; overflow: hidden; }
        .sh-sidebar-footer {
          padding: 10px; border-top: 0.5px solid var(--sh-border);
          display: flex; flex-direction: column; gap: 2px; flex-shrink: 0;
        }
        .sh-sidebar-footer-btn {
          display: flex; align-items: center; gap: 10px; padding: 8px 10px;
          border-radius: var(--sh-radius-sm); border: none; background: none; cursor: pointer;
          color: var(--sh-text-secondary);
          transition: background var(--sh-transition), color var(--sh-transition);
          white-space: nowrap; overflow: hidden; font-family: var(--font-sans); font-size: 13.5px;
          text-align: left; outline: none; width: 100%;
        }
        .sh-sidebar-footer-btn:hover { background: rgba(255,255,255,0.05); color: var(--sh-text-primary); }
        .sh-sidebar-footer-btn.danger:hover { background: rgba(248,113,113,0.08); color: #f87171; }
        .sh-sfb-icon {
          width: 36px; height: 36px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; border-radius: 9px;
        }
        .sh-sfb-label { transition: opacity var(--sh-transition); }
        .sh-sidebar.collapsed .sh-sfb-label { opacity: 0; }
        .sh-mobile-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 99;
        }
        .sh-mobile-overlay.show { display: block; }
        .sh-main {
          flex: 1; margin-left: var(--sh-sidebar-w);
          transition: margin-left var(--sh-transition); min-width: 0;
          display: flex; flex-direction: column;
        }
        .sh-main.sidebar-collapsed { margin-left: var(--sh-sidebar-collapsed-w); }
        .sh-topbar {
          position: sticky; top: 0; z-index: 90;
          height: var(--sh-topbar-h);
          background: rgba(7,11,18,0.82); backdrop-filter: blur(16px);
          border-bottom: 0.5px solid var(--sh-border);
          display: flex; align-items: center; padding: 0 20px 0 16px; gap: 12px;
        }
        .sh-topbar-hamburger {
          display: none; width: 34px; height: 34px;
          background: var(--sh-surface2); border: 0.5px solid var(--sh-border);
          border-radius: var(--sh-radius-sm);
          align-items: center; justify-content: center;
          cursor: pointer; color: var(--sh-text-secondary); flex-shrink: 0; outline: none;
        }
        .sh-topbar-hamburger:hover { color: var(--sh-text-primary); background: rgba(255,255,255,0.08); }
        .sh-topbar-search { flex: 1; max-width: 460px; position: relative; }
        .sh-topbar-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: var(--sh-text-muted); pointer-events: none;
        }
        .sh-topbar-search input {
          width: 100%; height: 36px;
          background: var(--sh-surface2); border: 0.5px solid var(--sh-border);
          border-radius: 100px; padding: 0 16px 0 38px;
          font-size: 13px; color: var(--sh-text-primary); font-family: var(--font-sans); outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; caret-color: var(--sh-accent);
        }
        .sh-topbar-search input::placeholder { color: var(--sh-text-muted); }
        .sh-topbar-search input:focus {
          border-color: rgba(52,211,153,0.4);
          background: rgba(52,211,153,0.04);
          box-shadow: 0 0 0 3px rgba(52,211,153,0.07);
        }
        .sh-topbar-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; }
        .sh-topbar-btn {
          position: relative; width: 36px; height: 36px;
          background: var(--sh-surface2); border: 0.5px solid var(--sh-border);
          border-radius: var(--sh-radius-sm);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--sh-text-secondary);
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          outline: none; text-decoration: none;
        }
        .sh-topbar-btn:hover { background: rgba(255,255,255,0.07); color: var(--sh-text-primary); border-color: var(--sh-border-hover); }
        .sh-topbar-btn-badge {
          position: absolute; top: -4px; right: -4px;
          min-width: 16px; height: 16px; background: var(--sh-accent);
          border: 1.5px solid var(--sh-bg); border-radius: 100px;
          font-size: 10px; font-weight: 700; font-family: var(--font-display); color: #051a10;
          display: flex; align-items: center; justify-content: center; padding: 0 3px;
        }
        .sh-topbar-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #34d399, #6366f1);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 12px; font-weight: 700; color: #fff;
          cursor: pointer; border: 1.5px solid var(--sh-border);
          transition: border-color 0.2s, box-shadow 0.2s; flex-shrink: 0;
        }
        .sh-topbar-avatar:hover { border-color: var(--sh-accent); box-shadow: 0 0 0 3px var(--sh-accent-dim); }
        .sh-page-content {
          flex: 1; padding: 28px 28px 48px;
          max-width: 1280px; width: 100%; align-self: flex-start;
        }
        .sh-mobile-tabbar {
          display: none; position: fixed; bottom: 0; left: 0; right: 0;
          height: 62px; background: rgba(12,17,28,0.95); backdrop-filter: blur(20px);
          border-top: 0.5px solid var(--sh-border); z-index: 95; padding: 0 8px;
          align-items: center; justify-content: space-around;
        }
        .sh-tab-item {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
          padding: 6px 4px; cursor: pointer; color: var(--sh-text-muted);
          border: none; background: none; outline: none; position: relative; text-decoration: none; transition: color 0.2s;
          font-family: var(--font-sans);
        }
        .sh-tab-item.active { color: var(--sh-accent); }
        .sh-tab-item-icon { position: relative; }
        .sh-tab-item-label { font-size: 11px; font-weight: 600; }
        .sh-tab-badge {
          position: absolute; top: -2px; right: -6px;
          min-width: 15px; height: 15px; background: var(--sh-accent);
          border-radius: 100px; font-size: 9px; font-weight: 700; color: #051a10;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--sh-surface); padding: 0 3px; font-family: var(--font-display);
        }
        .sh-tab-create {
          width: 46px; height: 46px; border-radius: 13px;
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          display: flex; align-items: center; justify-content: center; border: none; cursor: pointer;
          box-shadow: 0 4px 16px rgba(52,211,153,0.3);
          transition: transform 0.15s, box-shadow 0.15s; color: #fff; outline: none;
        }
        .sh-tab-create:hover { transform: scale(1.05); box-shadow: 0 6px 22px rgba(52,211,153,0.4); }
        .sh-tab-create:active { transform: scale(0.97); }
        @media (max-width: 1024px) {
          .sh-sidebar { transform: translateX(-100%); }
          .sh-sidebar.mobile-open { transform: translateX(0); }
          .sh-main { margin-left: 0 !important; }
          .sh-topbar-hamburger { display: flex; }
          .sh-mobile-tabbar { display: flex; }
          .sh-page-content { padding: 20px 16px 80px; }
        }
        @media (max-width: 640px) {
          .sh-page-content { padding: 16px 12px 80px; }
        }
      `}</style>

      <div className="sh-shell">
        <div
          className={`sh-mobile-overlay${mobileSidebarOpen ? ' show' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
        />

        <aside className={`sh-sidebar${sidebarCollapsed ? ' collapsed' : ''}${mobileSidebarOpen ? ' mobile-open' : ''}`}>
          <div className="sh-sidebar-glow" />

          <div className="sh-sidebar-header">
            <a href="/feed" className="sh-logo" onClick={(event) => handleNavigate(event, '/feed')}>
              <div className="sh-logo-icon">
                <PlusIcon />
              </div>
              <span className="sh-logo-text">StartupHub</span>
            </a>
            <button
              className="sh-collapse-btn"
              onClick={() => setSidebarCollapsed((value) => !value)}
              aria-label="Toggle sidebar"
              style={{ display: 'flex' }}
            >
              {sidebarCollapsed ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
              )}
            </button>
          </div>

          <a href="/profile/me" className="sh-user-card" onClick={(event) => handleNavigate(event, '/profile/me')}>
            <div className="sh-user-avatar">
              {currentUser?.name?.slice(0, 2).toUpperCase() ?? 'AK'}
              <div className="sh-user-avatar-online" />
            </div>
            <div className="sh-user-info">
              <div className="sh-user-name">{currentUser?.name ?? 'Arjun Kapoor'}</div>
            </div>
          </a>

          <nav className="sh-nav">
            <div className="sh-nav-section-label">Main</div>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => handleNavigate(event, item.href)}
                className={`sh-nav-item${isActive(item.href) ? ' active' : ''}`}
              >
                <div className="sh-nav-icon">{item.icon}</div>
                <span className="sh-nav-label">{item.label}</span>
                {item.badge > 0 && <span className="sh-nav-badge">{item.badge}</span>}
              </a>
            ))}
          </nav>

          <button className="sh-create-btn mb-10" onClick={() => setCreateOpen(true)}>
            <span className="sh-create-btn-icon"><PlusIcon /></span>
            <span className="sh-create-btn-text">New Post</span>
          </button>

          <div className="sh-sidebar-footer">
            <button className="sh-sidebar-footer-btn danger" onClick={handleLogout}>
              <div className="sh-sfb-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <span className="sh-sfb-label">Sign out</span>
            </button>
          </div>
        </aside>

        <div className={`sh-main${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
          <header className="sh-topbar">
            <button
              className="sh-topbar-hamburger"
              onClick={() => setMobileSidebarOpen((value) => !value)}
              aria-label="Open menu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="sh-topbar-search">
              <div className="sh-topbar-search-icon"><SearchIcon /></div>
              <input placeholder="Search founders, startups, investors..." />
            </div>

            <div className="sh-topbar-actions">
              <a href="/notifications" className="sh-topbar-btn" onClick={(event) => handleNavigate(event, '/notifications')}>
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="sh-topbar-btn-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </a>
              <a href="/messages" className="sh-topbar-btn" onClick={(event) => handleNavigate(event, '/messages')}>
                <MessageIcon />
                {unreadMessageCount > 0 && (
                  <span className="sh-topbar-btn-badge">{unreadMessageCount > 99 ? '99+' : unreadMessageCount}</span>
                )}
              </a>
              <div className="sh-topbar-avatar" onClick={() => handleProfileClick('/profile/me')}>
                {currentUser?.name?.slice(0, 2).toUpperCase() ?? 'AK'}
              </div>
            </div>
          </header>

          <main className="sh-page-content">
            <Outlet context={{ openCreatePost: () => setCreateOpen(true) }} />
          </main>
        </div>

        <nav className="sh-mobile-tabbar">
          {mobileNavItems.slice(0, 2).map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => handleNavigate(event, item.href)}
              className={`sh-tab-item${isActive(item.href) ? ' active' : ''}`}
            >
              <span className="sh-tab-item-icon">{item.icon}</span>
              <span className="sh-tab-item-label">{item.label}</span>
            </a>
          ))}

          <button className="sh-tab-create" onClick={() => setCreateOpen(true)} aria-label="Create post">
            <PlusIcon />
          </button>

          {mobileNavItems.slice(2).map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => handleNavigate(event, item.href)}
              className={`sh-tab-item${isActive(item.href) ? ' active' : ''}`}
            >
              <span className="sh-tab-item-icon">
                {item.icon}
                {item.badge > 0 && <span className="sh-tab-badge">{item.badge}</span>}
              </span>
              <span className="sh-tab-item-label">{item.label}</span>
            </a>
          ))}
        </nav>

        <CreatePostModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      </div>
    </>
  )
}
