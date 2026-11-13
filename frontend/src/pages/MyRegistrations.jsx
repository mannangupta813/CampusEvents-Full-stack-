import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppFeatures } from '../context/AppFeaturesContext';
import CalendarView from '../components/CalendarView';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  QrCode, 
  Heart, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Bell, 
  Trash2, 
  ArrowRight, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export default function MyRegistrations() {
  const { user } = useAuth();
  const { wishlist, toggleWishlist, showToast } = useAppFeatures();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState('registrations'); // 'registrations', 'wishlist', 'calendar', 'reminders'
  const [regStatusFilter, setRegStatusFilter] = useState('ALL'); // 'ALL', 'CONFIRMED', 'ATTENDED', 'CANCELLED'

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await api.getMyRegistrations();
      setRegistrations(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load registrations', 'error');
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
      showToast(`Registration for "${eventTitle}" has been cancelled.`, 'info');
      loadRegistrations();
    } catch (err) {
      showToast(err.message || 'Failed to cancel registration', 'error');
    }
  };

  // KPIs
  const totalCount = registrations.length;
  const upcomingCount = registrations.filter(r => r.status === 'CONFIRMED').length;
  const attendedCount = registrations.filter(r => r.status === 'ATTENDED').length;
  const wishlistCount = wishlist.length;

  const filteredRegistrations = registrations.filter(r => {
    if (regStatusFilter === 'CONFIRMED') return r.status === 'CONFIRMED';
    if (regStatusFilter === 'ATTENDED') return r.status === 'ATTENDED';
    if (regStatusFilter === 'CANCELLED') return r.status === 'CANCELLED';
    return true;
  });

  // Extract registered events for Calendar
  const registeredEventsForCalendar = registrations
    .filter(r => r.status !== 'CANCELLED')
    .map(r => ({
      id: r.eventId,
      title: r.eventTitle,
      eventDate: r.eventDate,
      eventTime: r.eventTime,
      venue: r.venue,
      status: r.status
    }));

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-primary">Student Command Center</span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem' }}>
          Welcome back, {user?.fullName || 'Student'}
        </h1>
        <p className="text-muted" style={{ fontSize: '0.95rem' }}>
          Roll No: <strong>{user?.rollNo || '21BCS1045'}</strong> &middot; Department of {user?.department || 'Computer Science'}
        </p>
      </div>

      {/* Metric KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap">
            <Ticket size={24} />
          </div>
          <div>
            <div className="metric-val">{totalCount}</div>
            <div className="metric-lbl">Total Registered</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="metric-val">{upcomingCount}</div>
            <div className="metric-lbl">Upcoming Events</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="metric-val">{attendedCount}</div>
            <div className="metric-lbl">Attended Check-ins</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
            <Heart size={24} />
          </div>
          <div>
            <div className="metric-val">{wishlistCount}</div>
            <div className="metric-lbl">Saved to Wishlist</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          onClick={() => setMainTab('registrations')} 
          className={`tab-btn ${mainTab === 'registrations' ? 'active' : ''}`}
        >
          <Ticket size={16} /> My Event Passes ({totalCount})
        </button>

        <button 
          onClick={() => setMainTab('wishlist')} 
          className={`tab-btn ${mainTab === 'wishlist' ? 'active' : ''}`}
        >
          <Heart size={16} /> Saved Wishlist ({wishlistCount})
        </button>

        <button 
          onClick={() => setMainTab('calendar')} 
          className={`tab-btn ${mainTab === 'calendar' ? 'active' : ''}`}
        >
          <Calendar size={16} /> Personal Schedule
        </button>

        <button 
          onClick={() => setMainTab('reminders')} 
          className={`tab-btn ${mainTab === 'reminders' ? 'active' : ''}`}
        >
          <Bell size={16} /> Activity &amp; Reminders
        </button>
      </div>

      {/* ==========================================================
          TAB 1: EVENT PASSES & REGISTRATIONS
          ========================================================== */}
      {mainTab === 'registrations' && (
        <div>
          {/* Sub-filter pills */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setRegStatusFilter('ALL')} 
              className={`badge ${regStatusFilter === 'ALL' ? 'badge-primary' : 'badge-outline'}`}
              style={{ cursor: 'pointer', padding: '0.45rem 0.85rem' }}
            >
              All Passes ({registrations.length})
            </button>
            <button 
              onClick={() => setRegStatusFilter('CONFIRMED')} 
              className={`badge ${regStatusFilter === 'CONFIRMED' ? 'badge-primary' : 'badge-outline'}`}
              style={{ cursor: 'pointer', padding: '0.45rem 0.85rem' }}
            >
              Confirmed / Upcoming ({upcomingCount})
            </button>
            <button 
              onClick={() => setRegStatusFilter('ATTENDED')} 
              className={`badge ${regStatusFilter === 'ATTENDED' ? 'badge-primary' : 'badge-outline'}`}
              style={{ cursor: 'pointer', padding: '0.45rem 0.85rem' }}
            >
              Attended ({attendedCount})
            </button>
            <button 
              onClick={() => setRegStatusFilter('CANCELLED')} 
              className={`badge ${regStatusFilter === 'CANCELLED' ? 'badge-primary' : 'badge-outline'}`}
              style={{ cursor: 'pointer', padding: '0.45rem 0.85rem' }}
            >
              Cancelled
            </button>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-xl)' }}></div>
          ) : filteredRegistrations.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {filteredRegistrations.map(reg => (
                <div 
                  key={reg.id} 
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                      <span className="badge badge-accent">Pass #{reg.id}</span>
                      {reg.status === 'CONFIRMED' && (
                        <span className="badge badge-success">✓ Confirmed</span>
                      )}
                      {reg.status === 'ATTENDED' && (
                        <span className="badge badge-primary">★ Attended</span>
                      )}
                      {reg.status === 'CANCELLED' && (
                        <span className="badge badge-danger">Cancelled</span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                      {reg.eventTitle}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} className="text-primary" />
                        <span>{reg.eventDate} &middot; {reg.eventTime}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} className="text-primary" />
                        <span>{reg.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {reg.status !== 'CANCELLED' ? (
                      <>
                        <Link 
                          to={`/qr-pass/${reg.id}`} 
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          <QrCode size={15} /> Open QR Pass
                        </Link>
                        {reg.status === 'CONFIRMED' && (
                          <button 
                            onClick={() => handleCancelRegistration(reg.id, reg.eventTitle)}
                            className="btn btn-outline btn-sm"
                            title="Cancel Registration"
                            style={{ color: 'var(--danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                        Registration cancelled &middot; pass deactivated
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '4rem 2rem',
              textAlign: 'center'
            }}>
              <Ticket size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Registrations Found</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                You have not registered for any events under this filter yet.
              </p>
              <Link to="/events" className="btn btn-primary">
                Browse Campus Events
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ==========================================================
          TAB 2: WISHLIST (SAVED EVENTS)
          ========================================================== */}
      {mainTab === 'wishlist' && (
        <div>
          {wishlist.length > 0 ? (
            <div className="events-grid">
              {wishlist.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-card-img-wrap">
                    <img src={event.bannerUrl} alt={event.title} className="event-card-img" />
                    <button 
                      onClick={() => toggleWishlist(event)} 
                      className="card-wishlist-btn active"
                      title="Remove from Wishlist"
                    >
                      <Heart size={16} fill="#ffffff" />
                    </button>
                    <span className="badge badge-accent" style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                      {event.categoryName}
                    </span>
                  </div>

                  <div className="event-card-body">
                    <h3 className="event-card-title">{event.title}</h3>
                    <p className="event-card-desc">{event.description}</p>

                    <div className="event-meta-row">
                      <div className="event-meta-item">
                        <Calendar size={14} className="text-primary" />
                        <span>{event.eventDate}</span>
                      </div>
                      <div className="event-meta-item">
                        <MapPin size={14} className="text-primary" />
                        <span>{event.venue}</span>
                      </div>
                    </div>

                    <div className="event-card-footer">
                      <button 
                        onClick={() => toggleWishlist(event)} 
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--danger)' }}
                      >
                        Remove
                      </button>
                      <Link to={`/events/${event.id}`} className="btn btn-primary btn-sm">
                        Register Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '4rem 2rem',
              textAlign: 'center'
            }}>
              <Heart size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your Wishlist is Empty</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Click the heart icon on any event card to save it here for quick access later.
              </p>
              <Link to="/events" className="btn btn-primary">
                Explore Events to Save
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ==========================================================
          TAB 3: PERSONAL MONTHLY CALENDAR
          ========================================================== */}
      {mainTab === 'calendar' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Your Registered Event Calendar
            </h3>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Days with registered events are marked with interactive colored chips.
            </p>
          </div>
          <CalendarView events={registeredEventsForCalendar} />
        </div>
      )}

      {/* ==========================================================
          TAB 4: REMINDERS & ACTIVITY LOG
          ========================================================== */}
      {mainTab === 'reminders' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Student Reminders &amp; Activity
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={20} />
              </div>
              <div>
                <strong>Event Reminder: CodeSprint 2026</strong>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  The 24-hour hackathon starts in 3 days. Please bring your laptop and charger to Tech Complex Lab 4.
                </p>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Sent today at 09:00 AM</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <strong>Attendance Verified: AI Innovation Workshop</strong>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Your turnstile check-in was recorded successfully by Organizer Board. Certificate eligible.
                </p>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>2 days ago</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <strong>Registration Deadline Warning: E-Summit 2026</strong>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Pitch desk submissions close in 48 hours for angel investor rounds.
                </p>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Yesterday</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
