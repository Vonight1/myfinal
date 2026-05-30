import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Polling unread count ທຸກໆ 30 ວິນາທີ
  useEffect(() => {
    if (!user) return;
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // ປິດ dropdown ເມື່ອກົດນອກ
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUnreadCount = () => {
    notificationsAPI.unreadCount()
      .then(r => { if (r.data.success) setUnreadCount(r.data.data.count || 0); })
      .catch(() => {});
  };

  const loadNotifications = () => {
    setLoading(true);
    notificationsAPI.getMine()
      .then(r => { if (r.data.success) setNotifications(r.data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleToggle = () => {
    if (!open) loadNotifications();
    setOpen(!open);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleClickNotification = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationsAPI.markRead(notif.id);
        setUnreadCount(Math.max(0, unreadCount - 1));
        setNotifications(notifications.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch {}
    }
    setOpen(false);
  };

  // ຟໍແມັດເວລາແບບ relative ("5 ນາທີຜ່ານມາ")
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = (new Date() - new Date(dateStr)) / 1000; // ວິນາທີ
    if (diff < 60) return 'ບໍ່ດົນມານີ້';
    if (diff < 3600) return Math.floor(diff / 60) + ' ນາທີຜ່ານມາ';
    if (diff < 86400) return Math.floor(diff / 3600) + ' ຊມ. ຜ່ານມາ';
    if (diff < 604800) return Math.floor(diff / 86400) + ' ມື້ຜ່ານມາ';
    return new Date(dateStr).toLocaleDateString('lo-LA');
  };

  const typeColor = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const typeIcon = {
    success: { bg: 'bg-green-100', text: 'text-green-600' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    error: { bg: 'bg-red-100', text: 'text-red-600' },
    info: { bg: 'bg-blue-100', text: 'text-blue-600' },
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all"
        aria-label="ແຈ້ງເຕືອນ"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[500px] flex flex-col overflow-hidden z-[60]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">ແຈ້ງເຕືອນ</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-blue-600 font-medium hover:underline">
                ໝາຍວ່າອ່ານທັງໝົດ
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-50">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p className="text-sm">ຍັງບໍ່ມີແຈ້ງເຕືອນ</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((n) => {
                  const cfg = typeIcon[n.type] || typeIcon.info;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClickNotification(n)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-all flex gap-3 ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className={`w-9 h-9 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center shrink-0`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <p className={`text-sm flex-1 ${!n.is_read ? 'font-semibold text-gray-800' : 'font-medium text-gray-700'}`}>
                            {n.title}
                          </p>
                          {!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
