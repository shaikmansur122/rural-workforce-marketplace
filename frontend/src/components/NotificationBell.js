import React, { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import api from '../api/axios';
import '../styles/notifications.css';

function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
}

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch {
      // silently ignore fetch errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silently ignore
    }
  };

  return (
    <div className="notif-container" ref={containerRef}>
      <button
        className="notif-bell-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span className="notif-title">Notifications</span>
            <button className="notif-mark-all-btn" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="notif-empty">No notifications</p>
          ) : (
            <ul className="notif-list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`notif-item${n.read ? '' : ' notif-item--unread'}`}
                >
                  <span className="notif-message">{n.message}</span>
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
