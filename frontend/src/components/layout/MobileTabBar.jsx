import { Bell, Compass, Home, MessageCircle, PlusSquare, UserCircle2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/feed', label: 'Feed', icon: Home },
  { to: '/discover', label: 'Discover', icon: Compass },
  { action: 'create', label: 'Create', icon: PlusSquare },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/profile/me', label: 'Profile', icon: UserCircle2 },
]

export default function MobileTabBar({ onCreatePost, unreadCount }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-3xl border border-white/10 bg-slate-950/85 px-3 py-2 shadow-glow backdrop-blur-xl lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon

        if (item.action === 'create') {
          return (
            <button
              key={item.label}
              type="button"
              onClick={onCreatePost}
              className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs text-white"
            >
              <span className="rounded-2xl bg-primary p-2 text-white">
                <Icon size={18} />
              </span>
              {item.label}
            </button>
          )
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs ${
                isActive ? 'text-white' : 'text-[rgb(var(--text-soft))]'
              }`
            }
          >
            <Icon size={18} />
            {item.label}
            {item.label === 'Profile' && unreadCount > 0 && (
              <span className="absolute right-2 top-1 rounded-full bg-primary px-1 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </NavLink>
        )
      })}
    </div>
  )
}
