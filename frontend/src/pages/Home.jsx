import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Home() {
  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalClubs: 18,
    totalEvents: 34,
    totalRegistrations: 2840
  });
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [statsData, eventsData, catData] = await Promise.all([
          api.getPublicStats(),
          api.getEvents({ upcomingOnly: true }),
          api.getCategories()
        ]);
        if (statsData) setStats(statsData);
        if (eventsData) setFeaturedEvents(eventsData.slice(0, 3));
        if (catData) setCategories(catData.slice(0, 8));
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="badge badge-primary">
              🚀 Official College Event Platform
            </span>
            <h1 className="hero-title">
              Discover. Register. <span className="gradient-text">Experience Campus.</span>
            </h1>
            <p className="hero-lead">
              From flagship 24-hour hackathons and entrepreneurship summits to cultural nights and sports leagues. Never miss what's happening on campus.
            </p>
            <div className="hero-actions">
              <Link to="/events" className="btn btn-primary btn-lg">
                Explore Events
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <Link to="/organizer" className="btn btn-secondary btn-lg">
                Host an Event
              </Link>
            </div>
          </div>

          {/* Featured Highlight Card */}
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-primary">Featured Event</span>
              <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>● Registration Open</span>
            </div>
            <div style={{ height: '180px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.25rem' }}>
              <img 
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80" 
                alt="CodeSprint 2026" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem' }}>CodeSprint 2026</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Main Tech Complex • 24-Hour Algorithmic Hackathon with $2,000 in Prizes.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600, paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <span>📅 Dec 15, 2026</span>
              <span>⏰ 09:00 AM</span>
              <span>📍 Tech Lab 4</span>
            </div>
            <Link to="/events" className="btn btn-primary btn-block" style={{ marginTop: '1.25rem' }}>
              Reserve Student Pass
            </Link>
          </div>
        </div>

        {/* Live Platform Stats */}
        <div className="container">
          <div className="stats-banner">
            <div className="stat-card">
              <div className="stat-icon">🎓</div>
              <div>
                <div className="stat-value">{stats.totalStudents || 1200}+</div>
                <div className="stat-label">Active Students</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎪</div>
              <div>
                <div className="stat-value">{stats.totalClubs || 15}+</div>
                <div className="stat-label">Official Clubs</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div>
                <div className="stat-value">{stats.totalEvents || 32}+</div>
                <div className="stat-label">Events Hosted</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎟️</div>
              <div>
                <div className="stat-value">{stats.totalRegistrations || 2400}+</div>
                <div className="stat-label">Passes Issued</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENT CATEGORIES SECTION */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Explore Categories</span>
            <h2 className="section-title">Events For Every Passion</h2>
            <p className="section-subtitle">Find workshops, tournaments, tech meetups, and concerts curated by student societies.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {categories.map(cat => (
              <Link 
                key={cat.id} 
                to={`/events?category=${encodeURIComponent(cat.name)}`}
                style={{ 
                  background: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  border: '1px solid var(--border)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                  {cat.name === 'Hackathons' ? '💻' :
                   cat.name === 'Workshops' ? '🛠️' :
                   cat.name === 'Technical' ? '⚡' :
                   cat.name === 'Cultural' ? '🎭' :
                   cat.name === 'Sports' ? '🏆' :
                   cat.name === 'Entrepreneurship' ? '🚀' :
                   cat.name === 'Competitions' ? '🎯' : '🎙️'}
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{cat.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Browse category →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS PREVIEW */}
      <section className="section" style={{ background: '#f1f5f9' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <span className="section-tag">Happening Soon</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Upcoming Campus Events</h2>
            </div>
            <Link to="/events" className="btn btn-secondary">
              View All Events ({stats.totalEvents || 6})
            </Link>
          </div>

          <div className="events-grid">
            {featuredEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-banner">
                  <img src={event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'} alt={event.title} />
                  <span className="event-category-chip">{event.categoryName || 'General'}</span>
                </div>
                <div className="event-body">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-desc">{event.description}</p>
                  <div className="event-meta">
                    <div className="meta-row">
                      <span className="meta-item">📅 {event.eventDate}</span>
                      <span className="meta-item">⏰ {event.eventTime}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-item">📍 {event.venue}</span>
                      <span className="badge badge-primary">{event.availableSeats || 0} seats left</span>
                    </div>
                  </div>
                  <div className="event-card-actions">
                    <Link to={`/events/${event.id}`} className="btn btn-secondary btn-block btn-sm">
                      Details
                    </Link>
                    <Link to={`/events/${event.id}`} className="btn btn-primary btn-block btn-sm">
                      Register Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Process</span>
            <h2 className="section-title">How Campus Events Works</h2>
            <p className="section-subtitle">A seamless journey from discovering an event to digital QR check-in at the venue.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eef2ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 1.25rem' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Browse & Filter</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Discover technical hackathons, entrepreneurship summits, sports, and cultural festivals with real-time filters.
              </p>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eef2ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 1.25rem' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>1-Click Registration</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Register securely with instant capacity validation, deadline enforcement, and duplicate entry prevention.
              </p>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eef2ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 1.25rem' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Get QR Event Pass</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Receive a tamper-proof digital QR ticket stored directly in your student dashboard, ready for download or offline display.
              </p>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eef2ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 1.25rem' }}>
                4
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Fast QR Check-in</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Organizers scan student QR passes at venue turnstiles with instant validation and automatic attendance logging.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
