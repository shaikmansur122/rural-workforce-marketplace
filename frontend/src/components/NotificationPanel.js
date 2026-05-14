import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, CheckCheck } from 'lucide-react';
import api from '../api/axios';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(res => setNotifications(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="fixed top-16 right-4 z-50 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-premium border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="font-bold text-gray-900 dark:text-white text-sm">Notifications</span>
          {unread > 0 && <span className="badge-green text-xs">{unread}</span>}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button onClick={markAllRead} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Mark all read">
              <CheckCheck size={14} className="text-emerald-500" />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <Bell size={28} className="text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800/50 transition-colors ${!n.isRead ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-emerald-500' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{n.message}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
