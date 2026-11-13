import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppFeatures } from '../context/AppFeaturesContext';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Calendar, 
  Ticket, 
  Trash2, 
  Search, 
  Plus, 
  ExternalLink,
  Layers,
  Sparkles,
  Tag
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useAppFeatures();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('USERS'); // USERS, CLUBS, EVENTS, CATEGORIES
  const [userSearch, setUserSearch] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, clubsData, eventsData, catData] = await Promise.all([
        api.getAdminStats(),
        api.getAllUsers(),
        api.getClubs(),
        api.getEvents(),
        api.getCategories()
      ]);
      setStats(statsData);
      setUsers(usersData || []);
      setClubs(clubsData || []);
      setEvents(eventsData || []);
      setCategories(catData || []);
    } catch (err) {
      showToast(err.message || 'Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      showToast('User role updated successfully.', 'success');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user account "${userName}"?`)) {
      return;
    }
    try {
      await api.deleteUser(userId);
      showToast('User account removed.', 'info');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Delete event "${title}" platform-wide?`)) return;
    try {
      await api.deleteEvent(id);
      showToast('Event removed.', 'info');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to delete event', 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.rollNo?.toLowerCase().includes(q);
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-primary">Institutional Administration</span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem' }}>
          Platform Admin Console
        </h1>
        <p className="text-muted" style={{ fontSize: '0.95rem' }}>
          Super Administrator access &middot; Manage university users, student societies, approvals &amp; system parameters.
        </p>
      </div>

      {/* KPI Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap">
            <Users size={24} />
          </div>
          <div>
            <div className="metric-val">{stats?.totalStudents || users.length}</div>
            <div className="metric-lbl">Total Registered Users</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="metric-val">{stats?.totalEvents || events.length}</div>
            <div className="metric-lbl">Total Events Managed</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <Ticket size={24} />
          </div>
          <div>
            <div className="metric-val">{stats?.totalRegistrations || 2840}</div>
            <div className="metric-lbl">Total Event Registrations</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div className="metric-val">{stats?.totalClubs || clubs.length}</div>
            <div className="metric-lbl">Registered Campus Clubs</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          onClick={() => setActiveTab('USERS')} 
          className={`tab-btn ${activeTab === 'USERS' ? 'active' : ''}`}
        >
          <Users size={16} /> User Roles ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('EVENTS')} 
          className={`tab-btn ${activeTab === 'EVENTS' ? 'active' : ''}`}
        >
          <Calendar size={16} /> Events Moderation ({events.length})
        </button>
        <button 
          onClick={() => setActiveTab('CLUBS')} 
          className={`tab-btn ${activeTab === 'CLUBS' ? 'active' : ''}`}
        >
          <Building2 size={16} /> Clubs &amp; Societies ({clubs.length})
        </button>
        <button 
          onClick={() => setActiveTab('CATEGORIES')} 
          className={`tab-btn ${activeTab === 'CATEGORIES' ? 'active' : ''}`}
        >
          <Tag size={16} /> Event Categories ({categories.length})
        </button>
      </div>

      {/* ==========================================================
          TAB 1: USER ROLES MANAGEMENT
          ========================================================== */}
      {activeTab === 'USERS' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem'
        }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Campus Directory &amp; Role-Based Authorization
            </h3>
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search by name, email or roll no..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User Profile</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Roll No / Dept</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Current Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Change Role</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700 }}>{u.fullName}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>{u.rollNo || 'N/A'}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.department || 'General'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {u.role === 'ROLE_ADMIN' ? (
                        <span className="badge badge-danger">ADMIN</span>
                      ) : u.role === 'ROLE_ORGANIZER' ? (
                        <span className="badge badge-accent">ORGANIZER</span>
                      ) : (
                        <span className="badge badge-primary">STUDENT</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        value={u.role} 
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="input-field"
                        style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                      >
                        <option value="ROLE_STUDENT">Student</option>
                        <option value="ROLE_ORGANIZER">Club Organizer</option>
                        <option value="ROLE_ADMIN">Administrator</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.fullName)}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--danger)' }}
                        title="Delete User"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 2: EVENTS MODERATION
          ========================================================== */}
      {activeTab === 'EVENTS' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Platform Events Directory ({events.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {events.map(event => (
              <div 
                key={event.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}
              >
                <img src={event.bannerUrl} alt={event.title} style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{event.title}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {event.clubName} &middot; {event.eventDate} &middot; {event.venue}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/events/${event.id}`} className="btn btn-outline btn-sm">
                    <ExternalLink size={14} />
                  </Link>
                  <button 
                    onClick={() => handleDeleteEvent(event.id, event.title)}
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 3: CLUBS & SOCIETIES
          ========================================================== */}
      {activeTab === 'CLUBS' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Recognized Student Organizations ({clubs.length})
          </h3>

          <div className="clubs-grid">
            {clubs.map(club => (
              <div key={club.id} className="club-card">
                <img src={club.logoUrl} alt={club.name} className="club-card-logo" />
                <h4 style={{ fontWeight: 700 }}>{club.name}</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.5rem 0' }}>
                  {club.description}
                </p>
                <span className="badge badge-accent">Approved Society</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 4: CATEGORIES
          ========================================================== */}
      {activeTab === 'CATEGORIES' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Configured Event Verticals ({categories.length})
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {categories.map(cat => (
              <div key={cat.id} style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{cat.name}</strong>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
