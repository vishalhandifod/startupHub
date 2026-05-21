import {
  Bell,
  Compass,
  Home,
  LogOut,
  MessageCircle,
  MoonStar,
  PlusSquare,
  Rocket,
  SunMedium,
  UserCircle2,
  BriefcaseBusiness,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import Avatar from '../common/Avatar.jsx'
import Button from '../common/Button.jsx'

const navItems = [
  { to: '/feed', label: 'Feed', icon: Home },
  { to: '/discover', label: 'Discover', icon: Compass },
  { action: 'create', label: 'Create Post', icon: PlusSquare },
  { to: '/startups', label: 'Startups', icon: BriefcaseBusiness },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile/me', label: 'Profile', icon: UserCircle2 },
]

export default function Sidebar({
  currentUser,
  onCreatePost,
  onLogout,
  theme,
  onToggleTheme,
  unreadCount,
}) {
  return (
    <aside className="hidden h-screen w-[280px] flex-col border-r border-white/10 px-5 py-6 lg:fixed lg:flex">
      <div className="glass-panel flex items-center gap-3 px-4 py-4">
        <div className="rounded-2xl bg-primary/15 p-3 text-primary">
          <Rocket size={22} />
        </div>
        <div>
          <p className="font-display text-2xl font-extrabold">StartupHub</p>
          <p className="subtle-text">Founders. Builders. Backers.</p>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          if (item.action === 'create') {
            return (
              <button
                key={item.label}
                type="button"
                onClick={onCreatePost}
                className="group flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition hover:bg-white/10"
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">New</span>
              </button>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-[rgb(var(--text-soft))] hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="flex items-center gap-3">
                <Icon size={18} />
                {item.label}
              </span>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">{unreadCount}</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="space-y-4">
        <Button
          type="button"
          variant="secondary"
          className="w-full justify-between"
          onClick={onToggleTheme}
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </span>
        </Button>

        <div className="glass-panel flex items-center gap-3 px-4 py-4">
          <Avatar src={currentUser?.profilePhoto} name={currentUser?.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{currentUser?.name}</p>
            <p className="truncate subtle-text">{currentUser?.email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full p-2 text-[rgb(var(--text-soft))] transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}
