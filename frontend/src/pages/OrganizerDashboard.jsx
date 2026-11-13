import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppFeatures } from '../context/AppFeaturesContext';
import { 
  Plus, 
  QrCode, 
  Calendar, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Search, 
  MapPin, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const { showToast } = useAppFeatures();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, eventsData] = await Promise.all([
        api.getOrganizerStats(),
        api.getEvents()
      ]);
      setStats(statsData);
      setEvents(eventsData || []);
    } catch (err) {
      showToast(err.message || 'Failed to load organizer dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    try {
      await api.deleteEvent(id);
      showToast(`Event "${title}" has been deleted.`, 'info');
      loadDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to delete event', 'error');
    }
  };

  // Calculations
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, e) => sum + (e.totalRegistrations || 0), 0);
  const totalCapacity = events.reduce((sum, e) => sum + (e.maxCapacity || 0), 0);
  const overallFillRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

  const filteredEvents = events.filter(e => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return e.title?.toLowerCase().includes(q) || e.venue?.toLowerCase().includes(q);
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header and Quick CTAs */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <span className="badge badge-accent">Host Management Portal</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem' }}>
            Club Organizer Hub
          </h1>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            Logged in as <strong>{user?.fullName}</strong> &middot; Manage registrations, update events &amp; scan attendance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/attendance" className="btn btn-secondary">
            <QrCode size={16} /> Open Turnstile Scanner
          </Link>
          <Link to="/create-event" className="btn btn-primary">
            <Plus size={16} /> Create New Event
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap">
            <Calendar size={24} />
          </div>
          <div>
            <div className="metric-val">{totalEvents}</div>
            <div className="metric-lbl">Total Events Managed</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="metric-val">{totalRegistrations}</div>
            <div className="metric-lbl">Total Registered Students</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="metric-val">{overallFillRate}%</div>
            <div className="metric-lbl">Capacity Utilization</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="metric-val">{stats?.totalAttendanceMarked || totalRegistrations}</div>
            <div className="metric-lbl">Verified Check-ins</div>
          </div>
        </div>
      </div>

      {/* Events Management Panel */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Published Events &amp; Rosters
            </h3>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              Showing {filteredEvents.length} events
            </span>
          </div>

          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search managed events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-lg)' }}></div>
        ) : filteredEvents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredEvents.map(event => (
              <div 
                key={event.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  flexWrap: 'wrap'
                }}
              >
                <img 
                  src={event.bannerUrl} 
                  alt={event.title} 
                  style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />

                <div style={{ flex: '1 1 240px' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="badge badge-accent">{event.categoryName}</span>
                    <span className="badge badge-outline">{event.clubName}</span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    {event.title}
                  </h4>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span><Calendar size={12} style={{ display: 'inline', marginRight: '3px' }} /> {event.eventDate}</span>
                    <span><Clock size={12} style={{ display: 'inline', marginRight: '3px' }} /> {event.eventTime}</span>
                    <span><MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} /> {event.venue}</span>
                  </div>
                </div>

                {/* Capacity Fill Bar */}
                <div style={{ minWidth: '160px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    <span>Registrations</span>
                    <span className="text-primary">{event.totalRegistrations} / {event.maxCapacity}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        background: 'var(--brand-gradient)', 
                        width: `${Math.min(100, Math.round((event.totalRegistrations / event.maxCapacity) * 100))}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                  <Link 
                    to={`/events/${event.id}`} 
                    className="btn btn-outline btn-sm"
                    title="View Public Page"
                  >
                    <ExternalLink size={14} />
                  </Link>

                  <Link 
                    to={`/attendance`} 
                    className="btn btn-secondary btn-sm"
                    title="Scan QR Tickets"
                  >
                    <QrCode size={14} /> Scan
                  </Link>

                  <Link 
                    to={`/edit-event/${event.id}`} 
                    className="btn btn-outline btn-sm"
                    title="Edit Event"
                  >
                    <Edit3 size={14} />
                  </Link>

                  <button 
                    onClick={() => handleDeleteEvent(event.id, event.title)}
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--danger)' }}
                    title="Delete Event"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Calendar size={36} className="text-muted" style={{ margin: '0 auto 0.75rem' }} />
            <h4>No Events Found</h4>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Create your first campus event to start accepting student registrations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
