import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppFeatures } from '../context/AppFeaturesContext';
import { 
  Calendar, 
  Sparkles, 
  Moon, 
  Sun, 
  Bell, 
  User, 
  LogOut, 
  Compass, 
  Ticket, 
  ShieldCheck, 
  Layers, 
  QrCode,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  X,
  Menu
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, login } = useAuth();
  const { theme, toggleTheme, wishlist } = useAppFeatures();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic notifications based on demo/real data
  const notifications = [
    { id: 1, title: 'CodeSprint 2026', time: 'In 3 days', desc: 'Hackathon starts at 9:00 AM in Tech Complex Lab 4' },
    { id: 2, title: 'E-Summit 2026', time: 'New Speaker', desc: 'Unicorn Founder Keynote confirmed for Grand Auditorium' },
    { id: 3, title: 'QR Pass Ready', time: 'Just now', desc: 'Your digital pass for registered events is active' }
  ];

  const handleQuickDemoSwitch = async (role) => {
    try {
      if (role === 'ADMIN') {
        await login('admin@campusevents.edu', 'Admin@123');
        navigate('/admin');
      } else if (role === 'ORGANIZER') {
        await login('organizer@campusevents.edu', 'Organizer@123');
        navigate('/organizer');
      } else {
        await login('student@campusevents.edu', 'Student@123');
        navigate('/my-registrations');
      }
    } catch (e) {
      console.log('Demo switch performed');
    }
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand */}
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Calendar size={22} strokeWidth={2.5} />
          </div>
          <span>Campus<span className="brand-accent">Events</span></span>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/events" className={`nav-link ${location.pathname === '/events' ? 'active' : ''}`}>
                <Compass size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Explore Events
              </Link>
            </li>

            {isAuthenticated && (user.role === 'ROLE_STUDENT' || user.role === 'ROLE_ADMIN') && (
              <li>
                <Link to="/my-registrations" className={`nav-link ${location.pathname === '/my-registrations' ? 'active' : ''}`}>
                  <Ticket size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  My Registrations
                  {wishlist.length > 0 && (
                    <span className="badge badge-accent" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>
                      {wishlist.length} saved
                    </span>
                  )}
                </Link>
              </li>
            )}

            {isAuthenticated && (user.role === 'ROLE_ORGANIZER' || user.role === 'ROLE_ADMIN') && (
              <>
                <li>
                  <Link to="/organizer" className={`nav-link ${location.pathname === '/organizer' ? 'active' : ''}`}>
                    <Layers size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Organizer Hub
                  </Link>
                </li>
                <li>
                  <Link to="/attendance" className={`nav-link ${location.pathname === '/attendance' ? 'active' : ''}`}>
                    <QrCode size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Scanner
                  </Link>
                </li>
              </>
            )}

            {isAuthenticated && user.role === 'ROLE_ADMIN' && (
              <li>
                <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                  <ShieldCheck size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Right side Controls */}
        <div className="nav-actions">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="btn-icon-circle" 
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-warning" /> : <Moon size={18} />}
          </button>

          {/* Notifications Center */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(prev => !prev)} 
              className="btn-icon-circle"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell size={18} />
              <span className="badge-dot"></span>
            </button>

            {showNotifications && (
              <div className="notification-menu">
                <div className="notification-header">
                  <span>Campus Alerts & Reminders</span>
                  <button 
                    onClick={() => setShowNotifications(false)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {notifications.map(n => (
                    <div key={n.id} className="notification-item">
                      <div className="flex-between">
                        <strong style={{ fontSize: '0.825rem' }}>{n.title}</strong>
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{n.time}</span>
                      </div>
                      <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Academic Role Segmented Control */}
          <div className="demo-role-bar" title="Quickly switch demo user roles">
            <button 
              onClick={() => handleQuickDemoSwitch('STUDENT')} 
              className={`demo-role-pill ${user?.role === 'ROLE_STUDENT' ? 'active' : ''}`}
            >
              <GraduationCap size={13} />
              <span>Student</span>
            </button>
            <button 
              onClick={() => handleQuickDemoSwitch('ORGANIZER')} 
              className={`demo-role-pill ${user?.role === 'ROLE_ORGANIZER' ? 'active' : ''}`}
            >
              <Briefcase size={13} />
              <span>Organizer</span>
            </button>
            <button 
              onClick={() => handleQuickDemoSwitch('ADMIN')} 
              className={`demo-role-pill ${user?.role === 'ROLE_ADMIN' ? 'active' : ''}`}
            >
              <ShieldCheck size={13} />
              <span>Admin</span>
            </button>
          </div>

          {/* User Profile / Auth State */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user.fullName}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {user.role.replace('ROLE_', '')}
                </div>
              </div>
              <button onClick={logout} className="btn btn-secondary btn-sm" title="Log Out">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
