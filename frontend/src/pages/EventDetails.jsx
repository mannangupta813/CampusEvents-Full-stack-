import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppFeatures } from '../context/AppFeaturesContext';
import FeedbackModal from '../components/FeedbackModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Heart, 
  Share2, 
  Building2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  MessageSquare, 
  Flame, 
  ChevronRight,
  ExternalLink,
  QrCode
} from 'lucide-react';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { wishlist, toggleWishlist, isWishlisted, shareEvent, openClubModal, getEventFeedbacks, showToast } = useAppFeatures();

  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedReg, setConfirmedReg] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    async function fetchEventAndRelated() {
      setLoading(true);
      try {
        const data = await api.getEventById(id);
        setEvent(data);

        // Fetch related events in the same category
        if (data && data.categoryId) {
          const allCatEvents = await api.getEvents({ categoryId: data.categoryId });
          setRelatedEvents(allCatEvents.filter(e => e.id !== Number(id)).slice(0, 3));
        }
      } catch (err) {
        showToast(err.message || 'Failed to load event details', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchEventAndRelated();
  }, [id]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      showToast('Please log in with your student account to register.', 'info');
      navigate(`/login?redirect=/events/${id}`);
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
      showToast('🎉 Registration confirmed! Your QR Pass has been generated.', 'success');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '100%', height: '380px', borderRadius: 'var(--radius-xl)' }}></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2>Event Not Found</h2>
        <p className="text-muted" style={{ margin: '1rem 0 1.5rem' }}>
          The requested campus event could not be located or has been archived.
        </p>
        <Link to="/events" className="btn btn-primary">Browse All Events</Link>
      </div>
    );
  }

  const isPast = new Date(event.eventDate) < new Date();
  const deadlinePassed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();
  const isFull = event.availableSeats <= 0;
  const isRegistered = event.isRegisteredByCurrentUser || Boolean(confirmedReg);

  const eventFeedbacks = getEventFeedbacks(event.id);
  const averageRating = eventFeedbacks.length > 0 
    ? (eventFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / eventFeedbacks.length).toFixed(1)
    : '5.0';

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      {/* Breadcrumb Path */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ArrowLeft size={14} /> Back to Events
        </Link>
        <span>/</span>
        <span>{event.categoryName}</span>
        <span>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{event.title}</span>
      </div>

      {/* Hero Banner Header */}
      <div style={{
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        height: '380px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <img 
          src={event.bannerUrl} 
          alt={event.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.3) 60%, transparent 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '2.5rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-accent">{event.categoryName}</span>
            <span 
              className="badge badge-outline" 
              style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', cursor: 'pointer' }}
              onClick={() => openClubModal({ id: event.clubId, name: event.clubName, logoUrl: event.clubLogoUrl })}
            >
              <Building2 size={12} /> {event.clubName}
            </span>
            {isFull && <span className="badge badge-danger">Sold Out / Capacity Full</span>}
            {isRegistered && <span className="badge badge-success">✓ You Are Registered</span>}
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="event-details-layout">
        {/* Left Column: Description, Rules, Eligibility, Reviews */}
        <div>
          {/* About Section */}
          <section style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              About This Event
            </h3>
            <p style={{ lineHeight: 1.7, color: 'var(--text-main)', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
              {event.description}
            </p>
          </section>

          {/* Eligibility & Rules */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={20} className="text-primary" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Eligibility Criteria</h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {event.eligibility || 'Open to all enrolled undergraduate and postgraduate university students.'}
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ShieldCheck size={20} className="text-primary" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Event Rules &amp; Code of Conduct</h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {event.rules || 'Valid college ID and digital QR pass required at entrance turnstiles. Respect code of conduct.'}
              </p>
            </div>
          </div>

          {/* Attendee Ratings & Reviews Section */}
          <section style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Student Reviews &amp; Feedback</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', color: '#f59e0b' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={16} fill="#f59e0b" stroke="#f59e0b" />
                    ))}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{averageRating} out of 5</span>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>({eventFeedbacks.length} reviews)</span>
                </div>
              </div>

              <button 
                onClick={() => setFeedbackOpen(true)} 
                className="btn btn-outline btn-sm"
              >
                <MessageSquare size={15} /> Leave Feedback
              </button>
            </div>

            {eventFeedbacks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {eventFeedbacks.map(f => (
                  <div key={f.id} style={{ background: 'var(--bg-subtle)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{f.userName}</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{f.createdAt}</span>
                    </div>
                    <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '0.5rem' }}>
                      {[...Array(f.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#f59e0b" stroke="#f59e0b" />
                      ))}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      "{f.comment}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                No reviews yet. Be the first student to review this event after attending!
              </p>
            )}
          </section>

          {/* Related Events Section */}
          {relatedEvents.length > 0 && (
            <section style={{ marginTop: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                More Events in {event.categoryName}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {relatedEvents.map(rel => (
                  <Link 
                    key={rel.id} 
                    to={`/events/${rel.id}`}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                  >
                    <img src={rel.bannerUrl} alt={rel.title} style={{ height: '120px', width: '100%', objectFit: 'cover' }} />
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>{rel.title}</h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> {rel.eventDate}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sticky Registration Box */}
        <div className="sticky-registration-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span className="badge badge-primary">Event Pass</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>
              Free Student Access
            </span>
          </div>

          {/* Date & Time */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <Calendar size={18} className="text-primary" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Event Date</strong>
                <div className="text-muted">{event.eventDate}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <Clock size={18} className="text-primary" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Time</strong>
                <div className="text-muted">{event.eventTime}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <MapPin size={18} className="text-primary" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Campus Venue</strong>
                <div className="text-muted">{event.venue}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <Users size={18} className="text-primary" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Registration Deadline</strong>
                <div className="text-muted">{event.registrationDeadline}</div>
              </div>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="seat-progress-container" style={{ marginBottom: '1.5rem' }}>
            <div className="seat-progress-labels">
              <span>Seat Availability</span>
              <span className="text-primary">
                {event.availableSeats} of {event.maxCapacity} remaining
              </span>
            </div>
            <div className="seat-progress-bar">
              <div 
                className="seat-progress-fill" 
                style={{ width: `${Math.min(100, Math.round((event.totalRegistrations / event.maxCapacity) * 100))}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {isRegistered ? (
              <Link 
                to={confirmedReg ? `/qr-pass/${confirmedReg.id}` : '/my-registrations'} 
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <QrCode size={18} /> View Digital QR Pass
              </Link>
            ) : isFull ? (
              <button disabled className="btn btn-secondary" style={{ width: '100%', cursor: 'not-allowed' }}>
                Capacity Full
              </button>
            ) : deadlinePassed ? (
              <button disabled className="btn btn-secondary" style={{ width: '100%', cursor: 'not-allowed' }}>
                Registration Closed
              </button>
            ) : (
              <button 
                onClick={handleRegister} 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={submitting}
              >
                {submitting ? 'Registering...' : 'Register for Event'}
              </button>
            )}

            {/* Wishlist & Share Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => toggleWishlist(event)} 
                className={`btn btn-outline ${isWishlisted(event.id) ? 'text-danger' : ''}`}
                style={{ justifyContent: 'center' }}
              >
                <Heart size={16} fill={isWishlisted(event.id) ? '#f43f5e' : 'none'} />
                {isWishlisted(event.id) ? 'Saved' : 'Wishlist'}
              </button>
              <button 
                onClick={() => shareEvent(event)} 
                className="btn btn-outline"
                style={{ justifyContent: 'center' }}
              >
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>

          {/* Organizer Club Mini Banner */}
          <div 
            style={{ 
              marginTop: '1.75rem', 
              paddingTop: '1.25rem', 
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer'
            }}
            onClick={() => openClubModal({ id: event.clubId, name: event.clubName, logoUrl: event.clubLogoUrl })}
            title="Click to view full club profile"
          >
            <img 
              src={event.clubLogoUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&q=80'} 
              alt={event.clubName} 
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Host Organization</div>
              <strong style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {event.clubName} <ExternalLink size={12} />
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal 
        event={event} 
        isOpen={feedbackOpen} 
        onClose={() => setFeedbackOpen(false)} 
      />
    </div>
  );
}
