import {
  BellRing, Heart, UserPlus, MessageCircle, Repeat2,
  Star, AtSign, Bell, CheckCheck, Loader2
} from 'lucide-react'
import { useContext, useState } from 'react'
import { NotificationContext } from '../contexts/NotificationContext.jsx'
import { useToast } from '../components/common/Toast.jsx'
import { getErrorMessage } from '../utils/apiError.js'
import { timeAgo } from '../utils/timeAgo.js'

/* ── Map notification type → icon + color ── */
function getTypeStyle(type = '') {
  const t = type.toLowerCase()
  if (t.includes('like'))    return { Icon: Heart,         color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.2)' }
  if (t.includes('follow'))  return { Icon: UserPlus,      color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.2)'  }
  if (t.includes('comment')) return { Icon: MessageCircle, color: '#818cf8', bg: 'rgba(129,140,248,0.12)', border: 'rgba(129,140,248,0.2)' }
  if (t.includes('repost') || t.includes('share'))
                             return { Icon: Repeat2,       color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.2)'  }
  if (t.includes('mention')) return { Icon: AtSign,        color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.2)'  }
  if (t.includes('star') || t.includes('feature'))
                             return { Icon: Star,          color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.2)'  }
  return                            { Icon: BellRing,      color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.2)'  }
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#059669','#6366f1','#d97706','#db2777','#0891b2','#7c3aed']
function avatarColor(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/* ── Notification row ── */
function NotifRow({ notification, onRead }) {
  const { Icon, color, bg, border } = getTypeStyle(notification.type)
  const isUnread = !notification.read
  const name = notification.actor?.name
  const photo = notification.actor?.profilePhoto

  return (
    <button
      type="button"
      onClick={() => isUnread && onRead(notification.id)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        width: '100%',
        textAlign: 'left',
        padding: '16px 18px',
        background: isUnread ? 'rgba(52,211,153,0.04)' : 'var(--sh-surface)',
        border: `0.5px solid ${isUnread ? 'rgba(52,211,153,0.18)' : 'var(--sh-border)'}`,
        borderRadius: '14px',
        cursor: isUnread ? 'pointer' : 'default',
        transition: 'background 0.15s, border-color 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => { if (isUnread) e.currentTarget.style.background = 'rgba(52,211,153,0.07)' }}
      onMouseLeave={e => { if (isUnread) e.currentTarget.style.background = 'rgba(52,211,153,0.04)' }}
    >
      {/* Unread accent bar */}
      {isUnread && (
        <div style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: '2.5px', borderRadius: '0 2px 2px 0',
          background: '#34d399',
        }} />
      )}

      {/* Type icon */}
      <div style={{
        width: '38px', height: '38px', borderRadius: '11px',
        background: bg, border: `0.5px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={16} color={color} />
      </div>

      {/* Actor avatar */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: photo ? 'transparent' : avatarColor(name ?? ''),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Syne', sans-serif",
        fontSize: '11px', fontWeight: 700, color: '#fff',
        flexShrink: 0, overflow: 'hidden',
        border: '0.5px solid var(--sh-border)',
      }}>
        {photo
          ? <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials(name)
        }
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{
            fontSize: '13.5px', fontWeight: isUnread ? 600 : 400,
            color: isUnread ? 'var(--sh-text-primary)' : 'rgba(241,245,249,0.75)',
            lineHeight: 1.45, margin: 0,
            fontFamily: isUnread ? "'Syne', sans-serif" : "'DM Sans', sans-serif",
          }}>
            {notification.message}
          </p>
          <span style={{
            fontSize: '11.5px', color: 'var(--sh-text-muted)',
            whiteSpace: 'nowrap', flexShrink: 0, marginTop: '1px',
          }}>
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 500,
            padding: '2px 8px', borderRadius: '100px',
            background: bg, color: color,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.2px',
          }}>
            {notification.type.replaceAll('_', ' ')}
          </span>
          {isUnread && (
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#34d399', display: 'inline-block',
            }} />
          )}
        </div>
      </div>
    </button>
  )
}

/* ── Skeleton row ── */
function SkeletonRow() {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '14px',
      padding: '16px 18px',
      background: 'var(--sh-surface)',
      border: '0.5px solid var(--sh-border)',
      borderRadius: '14px',
    }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '11px', ...SKEL }} />
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', ...SKEL }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ height: '12px', width: '65%', ...SKEL }} />
        <div style={{ height: '10px', width: '40%', ...SKEL }} />
      </div>
    </div>
  )
}

const SKEL = {
  background: 'linear-gradient(90deg, var(--sh-surface2) 25%, rgba(255,255,255,0.04) 50%, var(--sh-surface2) 75%)',
  backgroundSize: '200% 100%',
  animation: 'sh-shimmer 1.4s infinite',
  borderRadius: '8px',
}

/* ── Main page ── */
export default function NotificationsPage() {
  const { notifications, loading, readNotification } = useContext(NotificationContext)
  const { showToast } = useToast()
  const [markingAllRead, setMarkingAllRead] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  async function handleMarkAllRead() {
    if (!unreadCount) return
    setMarkingAllRead(true)
    try {
      await Promise.all(
        notifications.filter(n => !n.read).map(n => readNotification(n.id))
      )
      showToast({ title: 'Notifications cleared', message: 'Everything is marked as read.', tone: 'success' })
    } catch (error) {
      showToast({ title: 'Update failed', message: getErrorMessage(error, 'Notifications could not be updated.'), tone: 'error' })
    } finally {
      setMarkingAllRead(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes sh-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Header card ── */}
        <div style={{
          background: 'var(--sh-surface)',
          border: '0.5px solid var(--sh-border)',
          borderRadius: '16px',
          padding: '22px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '11px',
                background: 'rgba(52,211,153,0.12)', border: '0.5px solid rgba(52,211,153,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399',
                flexShrink: 0,
              }}>
                <Bell size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h1 style={{
                    fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 700,
                    color: 'var(--sh-text-primary)', letterSpacing: '-0.4px', margin: 0,
                  }}>
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <span style={{
                      fontFamily: "'Syne', sans-serif", fontSize: '11px', fontWeight: 700,
                      padding: '3px 9px', borderRadius: '100px',
                      background: 'rgba(52,211,153,0.15)', color: '#34d399',
                      border: '0.5px solid rgba(52,211,153,0.25)',
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--sh-text-secondary)', marginTop: '4px' }}>
                  Track likes, follows, and comments across your founder network.
                </p>
              </div>
            </div>

            {/* Mark all read button */}
            <button
              onClick={handleMarkAllRead}
              disabled={markingAllRead || !unreadCount}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 16px',
                background: unreadCount ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
                border: `0.5px solid ${unreadCount ? 'rgba(52,211,153,0.25)' : 'var(--sh-border)'}`,
                borderRadius: '10px',
                fontFamily: "'Syne', sans-serif", fontSize: '12.5px', fontWeight: 600,
                color: unreadCount ? '#34d399' : 'var(--sh-text-muted)',
                cursor: unreadCount ? 'pointer' : 'default',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (unreadCount) e.currentTarget.style.background = 'rgba(52,211,153,0.16)' }}
              onMouseLeave={e => { if (unreadCount) e.currentTarget.style.background = 'rgba(52,211,153,0.1)' }}
            >
              {markingAllRead
                ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
                : <CheckCheck size={13} />
              }
              Mark all read
            </button>
          </div>

          {/* Stats strip */}
          {!loading && notifications.length > 0 && (
            <div style={{
              display: 'flex', gap: '8px', marginTop: '18px',
              paddingTop: '14px', borderTop: '0.5px solid var(--sh-border)',
              flexWrap: 'wrap',
            }}>
              {[
                { label: 'Total', value: notifications.length, color: 'var(--sh-text-secondary)' },
                { label: 'Unread', value: unreadCount, color: '#34d399' },
                { label: 'Read', value: notifications.length - unreadCount, color: 'var(--sh-text-muted)' },
              ].map(stat => (
                <div key={stat.label} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px',
                  background: 'var(--sh-surface2)',
                  border: '0.5px solid var(--sh-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: stat.color, fontSize: '13px' }}>
                    {stat.value}
                  </span>
                  <span style={{ color: 'var(--sh-text-muted)' }}>{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── List ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
          </div>
        ) : notifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.map(notification => (
              <NotifRow
                key={notification.id}
                notification={notification}
                onRead={readNotification}
              />
            ))}
          </div>
        ) : (
          <div style={{
            background: 'var(--sh-surface)',
            border: '0.5px solid var(--sh-border)',
            borderRadius: '16px',
            padding: '56px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'rgba(52,211,153,0.1)', border: '0.5px solid rgba(52,211,153,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#34d399', marginBottom: '4px',
            }}>
              <BellRing size={22} />
            </div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 700, color: 'var(--sh-text-primary)', margin: 0 }}>
              You're all caught up!
            </p>
            <p style={{ fontSize: '13px', color: 'var(--sh-text-muted)', maxWidth: '260px', lineHeight: 1.55, margin: 0 }}>
              New likes, follows, and comments will appear here.
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}