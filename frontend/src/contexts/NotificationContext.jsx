import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getNotifications, markNotificationRead } from '../api/discover'
import { AuthContext } from './AuthContext.jsx'
import { useWebSocket } from '../hooks/useWebSocket.js'

export const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { token, currentUser } = useContext(AuthContext)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const handleNotification = useCallback((notification) => {
    setNotifications((current) => {
      const existing = current.find((item) => item.id === notification.id)
      if (existing) {
        return current.map((item) => (item.id === notification.id ? notification : item))
      }
      return [notification, ...current]
    })
  }, [])

  useWebSocket(currentUser?.id, handleNotification, '/queue/notifications')

  useEffect(() => {
    if (!token) {
      setNotifications([])
      setLoading(false)
      return
    }

    let ignore = false

    async function load() {
      setLoading(true)
      try {
        const data = await getNotifications()
        if (!ignore) {
          setNotifications(data)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [token])

  async function refreshNotifications() {
    if (!token) {
      return
    }
    const data = await getNotifications()
    setNotifications(data)
  }

  async function readNotification(notificationId) {
    const updated = await markNotificationRead(notificationId)
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? updated : item)),
    )
    return updated
  }

  const unreadCount = notifications.filter((item) => !item.read).length

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      refreshNotifications,
      readNotification,
      setNotifications,
    }),
    [notifications, unreadCount, loading],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
