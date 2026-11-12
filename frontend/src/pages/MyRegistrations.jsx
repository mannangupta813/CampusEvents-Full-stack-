import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyRegistrations() {
  const { user, addToast } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, UPCOMING, ATTENDED, CANCELLED

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await api.getMyRegistrations();
      setRegistrations(data || []);
    } catch (err) {
      addToast(err.message || 'Failed to load registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (id, eventTitle) => {
    if (!window.confirm(`Are you sure you want to cancel your registration for "${eventTitle}"?`)) {
      return;
    }

    try {
      await api.cancelRegistration(id);
      addToast(`Registration for "${eventTitle}" cancelled.`, 'warning');
      loadRegistrations();
    } catch (err) {
      addToast(err.message || 'Failed to cancel registration', 'error');
    }
  };

  // Stats
  const totalCount = registrations.length;
  const upcomingCount = registrations.filter(r => r.status === 'CONFIRMED').length;
  const attendedCount = registrations.filter(r => r.status === 'ATTENDED').length;
  const cancelledCount = registrations.filter(r => r.status === 'CANCELLED').length;

  const filteredRegistrations = registrations.filter(r => {
    if (activeTab === 'UPCOMING') return r.status === 'CONFIRMED';
    if (activeTab === 'ATTENDED') return r.status === 'ATTENDED';
    if (activeTab === 'CANCELLED') return r.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-primary">Student Dashboard</span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.4rem 0 0.25rem' }}>
              My Event Registrations
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Logged in as <strong>{user?.fullName}</strong> ({user?.rollNo || 'Roll No Unspecified'}) • {user?.department}
            </p>
          </div>
          <Link to="/events" className="btn btn-primary">
            + Discover More Events
          </Link>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon">🎟️</div>
            <div>
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">Total Passes</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>⏳</div>
            <div>
              <div className="stat-value">{upcomingCount}</div>
              <div className="stat-label">Upcoming Confirmed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>✅</div>
            <div>
              <div className="stat-value">{attendedCount}</div>
              <div className="stat-label">Checked In / Attended</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>❌</div>
            <div>
              <div className="stat-value">{cancelledCount}</div>
              <div className="stat-label">Cancelled</div>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="category-pills">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`pill-btn ${activeTab === 'ALL' ? 'active' : ''}`}
          >
            All Registrations ({totalCount})
          </button>
          <button 
            onClick={() => setActiveTab('UPCOMING')}
            className={`pill-btn ${activeTab === 'UPCOMING' ? 'active' : ''}`}
          >
            Confirmed Upcoming ({upcomingCount})
          </button>
          <button 
            onClick={() => setActiveTab('ATTENDED')}
            className={`pill-btn ${activeTab === 'ATTENDED' ? 'active' : ''}`}
          >
            Attended ({attendedCount})
          </button>
          <button 
            onClick={() => setActiveTab('CANCELLED')}
            className={`pill-btn ${activeTab === 'CANCELLED' ? 'active' : ''}`}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>

        {/* Registration Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            Loading your event passes...
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div style={{ textAlign: 'center', background: 'white', padding: '4rem 2rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No registrations found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              You have not registered for any events under this category yet.
            </p>
            <Link to="/events" className="btn btn-primary">
              Explore Upcoming Events
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.75rem' }}>
            {filteredRegistrations.map(reg => (
              <div 
                key={reg.id} 
                style={{ 
                  background: 'white', 
                  borderRadius: '20px', 
                  border: '1px solid var(--border)', 
                  overflow: 'hidden', 
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Banner */}
                <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                  <img 
                    src={reg.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'} 
                    alt={reg.eventTitle} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className="event-category-chip">{reg.categoryName || 'General'}</span>
                  
                  {/* Status badge in top right */}
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    {reg.status === 'ATTENDED' ? (
                      <span className="badge badge-success">✓ Attended</span>
                    ) : reg.status === 'CANCELLED' ? (
                      <span className="badge badge-danger">Cancelled</span>
                    ) : (
                      <span className="badge badge-primary">Confirmed</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    Pass ID: {reg.registrationNumber}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                    {reg.eventTitle}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    <div>📅 <strong>Date:</strong> {reg.eventDate} @ {reg.eventTime}</div>
                    <div>📍 <strong>Venue:</strong> {reg.venue}</div>
                    <div>🎪 <strong>Organizer:</strong> {reg.clubName || 'College Club'}</div>
                    {reg.checkedInAt && (
                      <div style={{ color: '#059669', fontWeight: 600 }}>
                        🕒 Checked in: {new Date(reg.checkedInAt).toLocaleString()} ({reg.checkinMethod})
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: reg.status === 'CONFIRMED' ? '1.5fr 1fr' : '1fr', gap: '0.75rem' }}>
                    {reg.status !== 'CANCELLED' ? (
                      <Link to={`/qr-pass/${reg.id}`} className="btn btn-primary btn-sm btn-block">
                        View QR Pass 🎟️
                      </Link>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.4rem 0' }}>
                        Registration Voided
                      </span>
                    )}

                    {reg.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => handleCancelRegistration(reg.id, reg.eventTitle)}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
