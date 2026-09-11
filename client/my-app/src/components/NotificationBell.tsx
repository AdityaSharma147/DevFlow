import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

type Notification = {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  async function fetchNotifications() {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleClick(notification: Notification) {
    if (!notification.read) {
      try {
        await api.patch(`/notifications/${notification.id}/read`);
        fetchNotifications();
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
    setOpen(false);
    if (notification.link) navigate(notification.link);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-slate-300 hover:text-white transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-slate-800">
            <p className="text-sm font-semibold text-white">Notifications</p>
          </div>
          {notifications.length === 0 ? (
            <p className="text-slate-500 text-sm p-4">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-slate-800 hover:bg-slate-800 transition ${
                  n.read ? "text-slate-400" : "text-white font-medium"
                }`}
              >
                <p>{n.message}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
