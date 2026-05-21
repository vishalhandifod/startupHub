import { BellRing } from 'lucide-react'
import { useContext, useState } from 'react'
import { NotificationContext } from '../contexts/NotificationContext.jsx'
import Avatar from '../components/common/Avatar.jsx'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import SkeletonLoader from '../components/common/SkeletonLoader.jsx'
import { useToast } from '../components/common/Toast.jsx'
import { getErrorMessage } from '../utils/apiError.js'
import { timeAgo } from '../utils/timeAgo.js'

export default function NotificationsPage() {
  const { notifications, loading, readNotification } = useContext(NotificationContext)
  const { showToast } = useToast()
  const [markingAllRead, setMarkingAllRead] = useState(false)

  async function handleMarkAllRead() {
    setMarkingAllRead(true)
    try {
      await Promise.all(notifications.filter((item) => !item.read).map((item) => readNotification(item.id)))
      showToast({
        title: 'Notifications cleared',
        message: 'Everything is marked as read.',
        tone: 'success',
      })
    } catch (error) {
      showToast({
        title: 'Update failed',
        message: getErrorMessage(error, 'Notifications could not be updated.'),
        tone: 'error',
      })
    } finally {
      setMarkingAllRead(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="mt-2 subtle-text">Track likes, follows, and comments across your founder network.</p>
          </div>
          <Button variant="secondary" onClick={handleMarkAllRead} loading={markingAllRead}>
            Mark all as read
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <SkeletonLoader className="h-24" />
          <SkeletonLoader className="h-24" />
          <SkeletonLoader className="h-24" />
        </div>
      ) : (
        notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => !notification.read && readNotification(notification.id)}
                className={`surface-card flex w-full items-start gap-4 p-5 text-left ${
                  !notification.read ? 'border-primary/30 bg-primary/10' : ''
                }`}
              >
                <div className="rounded-2xl bg-white/5 p-3">
                  <BellRing className="text-primary" size={20} />
                </div>
                <Avatar src={notification.actor?.profilePhoto} name={notification.actor?.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-left text-sm font-semibold">{notification.message}</p>
                    <span className="text-sm text-gray-400">{timeAgo(notification.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-left text-sm text-gray-400">{notification.type.replaceAll('_', ' ')}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BellRing}
            title="You're all caught up!"
            message="New likes, follows, and comments will appear here."
          />
        )
      )}
    </div>
  )
}
