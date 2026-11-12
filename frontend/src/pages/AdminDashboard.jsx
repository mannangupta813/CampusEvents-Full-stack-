import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, addToast } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('USERS'); // USERS, CLUBS, EVENTS, CATEGORIES
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
      addToast(err.message || 'Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      addToast('User role updated successfully.', 'success');
      loadAllAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Permanently delete account for "${name}"?`)) return;
    try {
      await api.deleteUser(userId);
      addToast(`User "${name}" deleted.`, 'success');
      loadAllAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`Permanently delete event "${title}"?`)) return;
    try {
      await api.deleteEvent(eventId);
      addToast(`Event "${title}" deleted.`, 'success');
      loadAllAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to delete event', 'error');
    }
  };

  return (
    <div className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container-wide">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-primary">Super Administrator</span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.4rem 0 0.25rem' }}>
              Campus Events Administration
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Logged in as <strong>{user?.fullName}</strong> • System configuration, student records, and club governance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/organizer" className="btn btn-secondary">
              Organizer Hub
            </Link>
            <Link to="/create-event" className="btn btn-primary">
              + Create Event
            </Link>
          </div>
        </div>

        {/* Global Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div>
              <div className="stat-value">{stats?.totalStudents || users.length}</div>
              <div className="stat-label">Total Registered Students</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fdf4ff', color: '#9333ea' }}>🎪</div>
            <div>
              <div className="stat-value">{stats?.totalClubs || clubs.length}</div>
              <div className="stat-label">Recognized Clubs</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div>
              <div className="stat-value">{stats?.totalEvents || events.length}</div>
              <div className="stat-label">Total Events Hosted</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>🎟️</div>
            <div>
              <div className="stat-value">{stats?.totalRegistrations || 1200}+</div>
              <div className="stat-label">Passes Issued</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>✅</div>
            <div>
              <div className="stat-value">{stats?.totalAttendance || 850}+</div>
              <div className="stat-label">Verified Check-ins</div>
            </div>
          </div>
        </div>

        {/* Management Tabs */}
        <div className="category-pills">
          <button 
            onClick={() => setActiveTab('USERS')}
            className={`pill-btn ${activeTab === 'USERS' ? 'active' : ''}`}
          >
            👥 Student & User Accounts ({users.length})
          </button>
          <button 
            onClick={() => setActiveTab('CLUBS')}
            className={`pill-btn ${activeTab === 'CLUBS' ? 'active' : ''}`}
          >
            🎪 Campus Clubs ({clubs.length})
          </button>
          <button 
            onClick={() => setActiveTab('EVENTS')}
            className={`pill-btn ${activeTab === 'EVENTS' ? 'active' : ''}`}
          >
            📅 All Campus Events ({events.length})
          </button>
          <button 
            onClick={() => setActiveTab('CATEGORIES')}
            className={`pill-btn ${activeTab === 'CATEGORIES' ? 'active' : ''}`}
          >
            🏷️ Event Categories ({categories.length})
          </button>
        </div>

        {/* Tab 1: Users */}
        {activeTab === 'USERS' && (
          <div className="table-card">
            <div className="table-header-row">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Student & Organizer Directory</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Manage access roles and campus profile permissions
                </span>
              </div>
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>College Email</th>
                  <th>Roll / Reg No</th>
                  <th>Department</th>
                  <th>Current Role</th>
                  <th>Promote / Assign Role</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.fullName}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.rollNo || '—'}</td>
                    <td>{u.department || 'General'}</td>
                    <td>
                      <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'badge-danger' : u.role === 'ROLE_ORGANIZER' ? 'badge-primary' : 'badge-success'}`}>
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="select-ctrl"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
                      >
                        <option value="ROLE_STUDENT">STUDENT</option>
                        <option value="ROLE_ORGANIZER">ORGANIZER</option>
                        <option value="ROLE_ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.fullName)}
                        className="btn btn-danger btn-sm"
                        disabled={u.id === user?.id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Clubs */}
        {activeTab === 'CLUBS' && (
          <div className="table-card">
            <div className="table-header-row">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Collegiate Clubs & Societies</h2>
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Club Name</th>
                  <th>Domain</th>
                  <th>Contact Email</th>
                  <th>Lead Organizer</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {clubs.map(cl => (
                  <tr key={cl.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          🎪
                        </div>
                        <strong>{cl.name}</strong>
                      </div>
                    </td>
                    <td><span className="badge badge-primary">{cl.category}</span></td>
                    <td>{cl.email || '—'}</td>
                    <td>{cl.leadUser?.fullName || 'Assigned Organizer'}</td>
                    <td>Active</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Events */}
        {activeTab === 'EVENTS' && (
          <div className="table-card">
            <div className="table-header-row">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>All Events Registry</h2>
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Club</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td><strong>{ev.title}</strong></td>
                    <td>{ev.clubName || 'College Club'}</td>
                    <td>{ev.eventDate} @ {ev.eventTime}</td>
                    <td>{ev.venue}</td>
                    <td>{ev.totalRegistrations || 0} / {ev.maxCapacity}</td>
                    <td>
                      {ev.isCancelled ? (
                        <span className="badge badge-danger">Cancelled</span>
                      ) : (
                        <span className="badge badge-success">Published</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteEvent(ev.id, ev.title)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Categories */}
        {activeTab === 'CATEGORIES' && (
          <div className="table-card">
            <div className="table-header-row">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Event Categories</h2>
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Icon</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td><code>{c.icon || 'calendar'}</code></td>
                    <td><span className="badge badge-success">Enabled</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

