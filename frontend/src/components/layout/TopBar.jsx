import { Bell, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TopBar({ unreadCount }) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[rgb(var(--bg))]/85 px-4 py-4 backdrop-blur-xl lg:hidden">
      <Link to="/feed" className="flex items-center gap-2">
        <div className="rounded-2xl bg-primary/15 p-2 text-primary">
          <Rocket size={20} />
        </div>
        <span className="font-display text-xl font-bold">StartupHub</span>
      </Link>
      <Link to="/notifications" className="relative rounded-full bg-white/5 p-2">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </Link>
    </div>
  )
}
