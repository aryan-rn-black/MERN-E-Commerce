import { HiOutlineBell, HiOutlineTrash } from 'react-icons/hi'
import Drawer from '../ui/Drawer.jsx'
import { useApp } from '../../context/AppContext.jsx'

export default function NotificationsDrawer({ open, onClose }) {
  const { notifications, unreadCount, markAllRead, clearNotifications } = useApp()

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Notifications"
      subtitle={unreadCount ? `${unreadCount} unread` : 'You\u2019re all caught up'}
      icon={HiOutlineBell}
      width="max-w-md"
      footer={
        notifications.length > 0 && (
          <div className="flex gap-2">
            <button onClick={markAllRead} className="btn-outline flex-1">Mark all read</button>
            <button onClick={clearNotifications} className="btn-ghost flex-1 text-rose-600">
              <HiOutlineTrash /> Clear
            </button>
          </div>
        )
      }
    >
      {!notifications.length ? (
        <div className="p-12 text-center">
          <div className="mx-auto w-20 h-20 grid place-items-center rounded-3xl bg-ink-100 text-ink-500">
            <HiOutlineBell size={32} />
          </div>
          <h3 className="font-display font-bold text-lg mt-3">No notifications</h3>
          <p className="text-sm text-ink-500 mt-1">We'll let you know when something important happens.</p>
        </div>
      ) : (
        <ul className="divide-y divide-ink-100">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-3 p-4 ${n.unread ? 'bg-brand-50/40' : ''}`}
            >
              <span
                className={`mt-1 inline-block w-2.5 h-2.5 rounded-full ${
                  n.unread ? 'bg-brand-500' : 'bg-ink-200'
                }`}
              />
              <div className="flex-1">
                <p className="font-medium text-ink-900">{n.title}</p>
                <p className="text-sm text-ink-500 mt-0.5">{n.body}</p>
                <p className="text-xs text-ink-400 mt-1">{n.time} ago</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  )
}
