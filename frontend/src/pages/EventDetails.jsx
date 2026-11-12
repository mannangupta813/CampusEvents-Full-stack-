import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, addToast } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedReg, setConfirmedReg] = useState(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const data = await api.getEventById(id);
        setEvent(data);
      } catch (err) {
        addToast(err.message || 'Failed to load event details', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      addToast('Please log in or create a student account to register.', 'warning');
      navigate('/login?redirect=/events/' + id);
      return;
    }

    setSubmitting(true);
    try {
      const reg = await api.registerForEvent(id);
      setConfirmedReg(reg);
      setEvent(prev => ({
        ...prev,
        isRegisteredByCurrentUser: true,
        availableSeats: Math.max(0, (prev.availableSeats || 1) - 1),
        totalRegistrations: (prev.totalRegistrations || 0) + 1
      }));
      addToast('Registration confirmed! Your QR pass is ready.', 'success');
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Event Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>The event you requested could not be located.</p>
        <Link to="/events" className="btn btn-primary">Browse All Events</Link>
      </div>
    );
  }

  const isPast = new Date(event.eventDate) < new Date();
  const deadlinePassed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();
  const isFull = event.availableSeats <= 0;
  const isRegistered = event.isRegisteredByCurrentUser || !!confirmedReg;

  return (
    <div className="section" style={{ paddingTop: '2rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'var(--primary)' }}>Home</Link> &gt;{' '}
          <Link to="/events" style={{ color: 'var(--primary)' }}>Events</Link> &gt;{' '}
          <span>{event.title}</span>
        </div>

        {/* Hero Banner */}
        <div style={{ position: 'relative', height: '360px', borderRadius: '24px', overflow: 'hidden', marginBottom: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
          <img 
            src={event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'} 
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.2) 60%)' }} />
          
          <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', color: 'white' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-primary">{event.categoryName || 'General'}</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{event.clubName || 'College Club'}</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.2 }}>{event.title}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.95rem', color: '#cbd5e1' }}>
              <span>📅 {event.eventDate}</span>
              <span>⏰ {event.eventTime}</span>
              <span>📍 {event.venue}</span>
            </div>
          </div>
        </div>

        {/* Layout: Content Left & Registration Card Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '3rem', alignItems: 'start' }}>
          
          {/* Main Details */}
          <div>
            {event.isCancelled && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem 1.5rem', borderRadius: '12px', color: '#991b1b', marginBottom: '1.5rem', fontWeight: 600 }}>
                ⚠️ Notice: This event has been cancelled by the club organizer.
              </div>
            )}

            <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>About the Event</h2>
              <p style={{ color: '#334155', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-line' }}>
                {event.description}
              </p>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>Eligibility & Requirements</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🎯</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Eligible Participants</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{event.eligibility || 'Open to all enrolled university students with valid ID.'}</div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' }}>Event Rules & Guidelines</h3>
              <div style={{ color: '#334155', lineHeight: 1.7, fontSize: '0.95rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                {event.rules || 'Please arrive 15 minutes prior to the start time with your digital QR pass. Maintain campus code of conduct.'}
              </div>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>Organizing Club</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
                  🎪
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{event.clubName || 'College Student Activities Club'}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Official recognized collegiate organization</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Sidebar Card */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem' }}>Registration Desk</h3>

              {/* Capacity Progress */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <span>Seats Filled</span>
                  <span>{event.totalRegistrations || 0} / {event.maxCapacity}</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${Math.min(100, (((event.totalRegistrations || 0) / event.maxCapacity) * 100))}%`, 
                      background: isFull ? 'var(--danger)' : 'var(--primary)',
                      borderRadius: '9999px',
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>{event.availableSeats} seats remaining</span>
                  <span>Free Registration</span>
                </div>
              </div>

              {/* Details List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Registration Deadline</span>
                  <span style={{ fontWeight: 600, color: deadlinePassed ? 'var(--danger)' : 'inherit' }}>
                    {event.registrationDeadline} {deadlinePassed && '(Closed)'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Event Date & Time</span>
                  <span style={{ fontWeight: 600 }}>{event.eventDate} @ {event.eventTime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Venue</span>
                  <span style={{ fontWeight: 600 }}>{event.venue}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Check-in Pass</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Digital QR Pass</span>
                </div>
              </div>

              {/* Action Button */}
              {isRegistered ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: '12px', color: '#065f46', marginBottom: '1rem', fontWeight: 600, fontSize: '0.95rem' }}>
                    ✓ You are registered for this event!
                  </div>
                  <Link 
                    to={`/qr-pass/${confirmedReg?.id || 'demo'}`} 
                    className="btn btn-primary btn-block btn-lg"
                  >
                    View My QR Event Pass 🎟️
                  </Link>
                  <Link to="/my-registrations" className="btn btn-secondary btn-block" style={{ marginTop: '0.75rem' }}>
                    Go to My Registrations
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={submitting || isPast || deadlinePassed || isFull || event.isCancelled}
                  className="btn btn-primary btn-block btn-lg"
                  style={{
                    opacity: (isPast || deadlinePassed || isFull || event.isCancelled) ? 0.6 : 1,
                    cursor: (isPast || deadlinePassed || isFull || event.isCancelled) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Confirming...' :
                   event.isCancelled ? 'Event Cancelled' :
                   isPast ? 'Event Has Ended' :
                   deadlinePassed ? 'Deadline Passed' :
                   isFull ? 'Capacity Full (Sold Out)' : 'Register for Event'}
                </button>
              )}

              <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', marginTop: '1rem' }}>
                Instant confirmation. A tamper-proof QR check-in pass will be issued to your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
