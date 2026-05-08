import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BookOpen, MessageSquare,
  Share2, User, LogOut, Bell, Users
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/app' },
  { icon: FileText,        label: 'Resume Builder', path: '/app/resume' },
  { icon: BookOpen,        label: 'Notes Sharing',  path: '/app/notes' },
  { icon: MessageSquare,   label: 'Doubt Solving',  path: '/app/qa' },
  { icon: Share2,          label: 'Social Feed',    path: '/app/feed' },
  { icon: Users,           label: 'Network',        path: '/app/network' },
  { icon: User,            label: 'Profile',        path: '/app/profile' },
];

export default function Layout() {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState([]);
  const [showNotifs, setShowNotifs] = React.useState(false);

  React.useEffect(() => {
    if (token) fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setNotifications(await res.json());
    } catch (e) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatarLetter = user?.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">EduNexus</div>
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.path === '/app'
              ? location.pathname === '/app'
              : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} className={isActive ? 'active' : ''}>
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div style={{ marginBottom: 12, position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowNotifs(!showNotifs)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#c7d2fe',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <Bell size={16} />
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifs && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                maxHeight: 300,
                overflowY: 'auto',
                zIndex: 50,
                marginBottom: 8
              }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => markAsRead(n._id, n.isRead)}
                      onKeyDown={(e) => e.key === 'Enter' && markAsRead(n._id, n.isRead)}
                      style={{
                        padding: '10px 14px',
                        fontSize: 13,
                        borderBottom: '1px solid #f3f4f6',
                        background: n.isRead ? 'white' : '#eff6ff',
                        cursor: 'pointer',
                        color: '#374151'
                      }}
                    >
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="sidebar-user">
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
              {user?.avatar ? <img src={user.avatar} alt="" /> : avatarLetter}
            </div>
            <div style={{ flex: 1 }}>
              <div className="user-name">{user?.name}</div>
              <div className="user-rep">⭐ {user?.reputation || 0} pts</div>
            </div>
            <button type="button" onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#c7d2fe', cursor: 'pointer' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
