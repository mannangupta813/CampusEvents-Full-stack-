import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <span>Campus<span className="brand-accent">Events</span></span>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/events" className={`nav-link ${location.pathname === '/events' ? 'active' : ''}`}>
                Explore Events
              </Link>
            </li>

            {isAuthenticated && (user.role === 'ROLE_STUDENT' || user.role === 'ROLE_ADMIN') && (
              <li>
                <Link to="/my-registrations" className={`nav-link ${location.pathname === '/my-registrations' ? 'active' : ''}`}>
                  My Registrations
                </Link>
              </li>
            )}

            {isAuthenticated && (user.role === 'ROLE_ORGANIZER' || user.role === 'ROLE_ADMIN') && (
              <>
                <li>
                  <Link to="/organizer" className={`nav-link ${location.pathname === '/organizer' ? 'active' : ''}`}>
                    Organizer Hub
                  </Link>
                </li>
                <li>
                  <Link to="/attendance" className={`nav-link ${location.pathname === '/attendance' ? 'active' : ''}`}>
                    Scan & Attendance
                  </Link>
                </li>
              </>
            )}

            {isAuthenticated && user.role === 'ROLE_ADMIN' && (
              <li>
                <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Right side Actions */}
        <div className="nav-actions">
          {/* Quick Academic Demo Switcher */}
          <div style={{ display: 'flex', gap: '0.35rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
            <button 
              onClick={() => handleQuickDemoSwitch('STUDENT')} 
              className={`btn btn-sm ${user?.role === 'ROLE_STUDENT' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              title="Test Student View"
            >
              🎓 Student
            </button>
            <button 
              onClick={() => handleQuickDemoSwitch('ORGANIZER')} 
              className={`btn btn-sm ${user?.role === 'ROLE_ORGANIZER' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              title="Test Organizer View"
            >
              🎪 Organizer
            </button>
            <button 
              onClick={() => handleQuickDemoSwitch('ADMIN')} 
              className={`btn btn-sm ${user?.role === 'ROLE_ADMIN' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              title="Test Admin View"
            >
              ⚡ Admin
            </button>
          </div>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user.fullName}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {user.role.replace('ROLE_', '')}
                </div>
              </div>
              <button onClick={logout} className="btn btn-secondary btn-sm" title="Log Out">
                Log Out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
