import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppFeatures } from '../context/AppFeaturesContext';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Heart, 
  Share2, 
  Terminal, 
  Lightbulb, 
  Cpu, 
  Trophy, 
  Music, 
  Award, 
  Briefcase, 
  Presentation,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, isWishlisted, openClubModal, shareEvent } = useAppFeatures();

  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalClubs: 18,
    totalEvents: 34,
    totalRegistrations: 2840
  });

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Countdown timer for featured event
  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 8, minutes: 24, seconds: 45 });

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [statsData, eventsData, catData, clubsData] = await Promise.all([
          api.getPublicStats(),
          api.getEvents({ upcomingOnly: true }),
          api.getCategories(),
          api.getClubs()
        ]);
        if (statsData) setStats(statsData);
        if (eventsData) setEvents(eventsData);
        if (catData) setCategories(catData);
        if (clubsData) setClubs(clubsData);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  // Featured event (CodeSprint 2026 or first event)
  const featuredEvent = events.length > 0 ? events[0] : null;

  // Countdown logic for featured event
  useEffect(() => {
    if (!featuredEvent) return;

    const timer = setInterval(() => {
      const targetDate = new Date(`${featuredEvent.eventDate}T09:00:00`).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [featuredEvent]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCategory) params.append('categoryId', selectedCategory);
    navigate(`/events?${params.toString()}`);
  };

  // Helper for Category Icons
  const getCategoryIcon = (name) => {
    switch (name?.toLowerCase()) {
      case 'hackathons': return <Terminal size={22} />;
      case 'workshops': return <Cpu size={22} />;
      case 'technical': return <CodeIcon size={22} />;
      case 'cultural': return <Music size={22} />;
      case 'sports': return <Trophy size={22} />;
      case 'entrepreneurship': return <Lightbulb size={22} />;
      case 'competitions': return <Award size={22} />;
      case 'seminars': return <Presentation size={22} />;
      default: return <Sparkles size={22} />;
    }
  };

  function CodeIcon({ size }) {
    return <Terminal size={size} />;
  }

  // Filter trending events (high registration momentum or 70%+ full)
  const trendingEvents = events.filter(e => (e.totalRegistrations / e.maxCapacity) >= 0.5 || e.totalRegistrations > 1).slice(0, 3);
  const upcomingEvents = events.slice(0, 6);

  return (
    <div>
      {/* ==========================================================
          HERO SECTION
          ========================================================== */}
      <section className="hero">
        <div className="container">
          <div className="hero-pill">
            <Sparkles size={15} className="text-primary" />
            <span>Collegiate Event Management &amp; Digital QR Pass Platform</span>
          </div>

          <h1 className="hero-title">
            Discover. Register. <br />
            <span className="brand-accent">Experience Campus Life.</span>
          </h1>

          <p className="hero-subtitle">
            From 24-hour algorithmic hackathons and venture conclaves to live indie concerts and sports leagues. Never miss an event at college again.
          </p>

          {/* Unified Discovery Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hero-search-box">
            <Search size={20} className="text-muted" style={{ marginLeft: '0.5rem' }} />
            <input 
              type="text" 
              className="hero-search-input"
              placeholder="Search hackathons, workshops, music nights, conferences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <select 
              className="hero-search-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <button type="submit" className="btn btn-primary btn-md">
              Find Events
            </button>
          </form>
        </div>
      </section>

      {/* ==========================================================
          FEATURED COUNTDOWN EVENT
          ========================================================== */}
      {featuredEvent && (
        <section className="container" style={{ marginTop: '-1.5rem', marginBottom: '4rem' }}>
          <div className="featured-banner">
            <div className="featured-img-wrap">
              <img 
                src={featuredEvent.bannerUrl} 
                alt={featuredEvent.title} 
                className="featured-img" 
              />
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-trending">
                  <Flame size={13} /> Marquee Highlight
                </span>
                <span className="badge badge-accent">
                  {featuredEvent.categoryName}
                </span>
              </div>
            </div>

            <div className="featured-content">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <Building2 size={15} />
                  <span>Organized by <strong>{featuredEvent.clubName}</strong></span>
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.75rem' }}>
                  {featuredEvent.title}
                </h2>

                <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {featuredEvent.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={15} className="text-primary" />
                    <span>{featuredEvent.eventDate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={15} className="text-primary" />
                    <span>{featuredEvent.eventTime}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={15} className="text-primary" />
                    <span>{featuredEvent.venue}</span>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="countdown-timer">
                  <div className="countdown-unit">
                    <span className="countdown-num">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="countdown-lbl">Days</span>
                  </div>
                  <div className="countdown-unit">
                    <span className="countdown-num">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="countdown-lbl">Hours</span>
                  </div>
                  <div className="countdown-unit">
                    <span className="countdown-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="countdown-lbl">Mins</span>
                  </div>
                  <div className="countdown-unit">
                    <span className="countdown-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="countdown-lbl">Secs</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem' }}>
                <Link to={`/events/${featuredEvent.id}`} className="btn btn-primary">
                  Register for Event <ArrowRight size={16} />
                </Link>
                <button 
                  onClick={() => toggleWishlist(featuredEvent)} 
                  className={`btn btn-outline ${isWishlisted(featuredEvent.id) ? 'text-danger' : ''}`}
                  title="Save to Wishlist"
                >
                  <Heart size={16} fill={isWishlisted(featuredEvent.id) ? '#f43f5e' : 'none'} />
                  {isWishlisted(featuredEvent.id) ? 'Saved' : 'Wishlist'}
                </button>
                <button 
                  onClick={() => shareEvent(featuredEvent)} 
                  className="btn btn-outline"
                  title="Share Event"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==========================================================
          EVENT CATEGORIES GRID
          ========================================================== */}
      <section className="container" style={{ marginBottom: '4.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <div>
            <span className="badge badge-primary">Curated Verticals</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem' }}>
              Explore Event Categories
            </h2>
          </div>
          <Link to="/events" className="btn btn-outline btn-sm">
            All Categories <ChevronRight size={14} />
          </Link>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="category-tile"
              onClick={() => navigate(`/events?categoryId=${cat.id}`)}
            >
              <div className="category-tile-icon">
                {getCategoryIcon(cat.name)}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================================
          TRENDING EVENTS ("FILLING FAST")
          ========================================================== */}
      {trendingEvents.length > 0 && (
        <section className="container" style={{ marginBottom: '4.5rem' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <div>
              <span className="badge badge-trending">
                <Flame size={13} /> High Demand
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem' }}>
                Trending &amp; Filling Fast
              </h2>
            </div>
            <Link to="/events" className="btn btn-outline btn-sm">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="events-grid">
            {trendingEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-img-wrap">
                  <img src={event.bannerUrl} alt={event.title} className="event-card-img" />
                  <button 
                    onClick={() => toggleWishlist(event)} 
                    className={`card-wishlist-btn ${isWishlisted(event.id) ? 'active' : ''}`}
                    title="Add to Wishlist"
                  >
                    <Heart size={16} fill={isWishlisted(event.id) ? '#ffffff' : 'none'} />
                  </button>
                  <span className="badge badge-trending" style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                    <Flame size={12} /> {event.totalRegistrations} Registered
                  </span>
                </div>

                <div className="event-card-body">
                  <div className="flex-between">
                    <span className="event-card-category">{event.categoryName}</span>
                    <span 
                      style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                      onClick={() => openClubModal({ id: event.clubId, name: event.clubName, logoUrl: event.clubLogoUrl })}
                    >
                      {event.clubName}
                    </span>
                  </div>

                  <h3 className="event-card-title">{event.title}</h3>
                  <p className="event-card-desc">{event.description}</p>

                  <div className="event-meta-row">
                    <div className="event-meta-item">
                      <Calendar size={14} className="text-primary" />
                      <span>{event.eventDate}</span>
                    </div>
                    <div className="event-meta-item">
                      <Clock size={14} className="text-primary" />
                      <span>{event.eventTime}</span>
                    </div>
                  </div>

                  <div className="event-meta-row">
                    <div className="event-meta-item">
                      <MapPin size={14} className="text-primary" />
                      <span>{event.venue}</span>
                    </div>
                  </div>

                  {/* Seat Availability Progress Bar */}
                  <div className="seat-progress-container">
                    <div className="seat-progress-labels">
                      <span>Seats Availability</span>
                      <span className="text-primary">
                        {event.availableSeats} of {event.maxCapacity} Left
                      </span>
                    </div>
                    <div className="seat-progress-bar">
                      <div 
                        className="seat-progress-fill" 
                        style={{ width: `${Math.min(100, Math.round((event.totalRegistrations / event.maxCapacity) * 100))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="event-card-footer">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Deadline: {event.registrationDeadline}
                    </span>
                    <Link to={`/events/${event.id}`} className="btn btn-primary btn-sm">
                      Register Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==========================================================
          UPCOMING EVENTS SHOWCASE
          ========================================================== */}
      <section className="container" style={{ marginBottom: '4.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <div>
            <span className="badge badge-primary">Calendar Schedule</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem' }}>
              Upcoming Campus Events
            </h2>
          </div>
          <Link to="/events" className="btn btn-outline btn-sm">
            View Catalogue <ChevronRight size={14} />
          </Link>
        </div>

        <div className="events-grid">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-card-img-wrap">
                <img src={event.bannerUrl} alt={event.title} className="event-card-img" />
                <button 
                  onClick={() => toggleWishlist(event)} 
                  className={`card-wishlist-btn ${isWishlisted(event.id) ? 'active' : ''}`}
                  title="Add to Wishlist"
                >
                  <Heart size={16} fill={isWishlisted(event.id) ? '#ffffff' : 'none'} />
                </button>
                <span className="badge badge-accent" style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                  {event.categoryName}
                </span>
              </div>

              <div className="event-card-body">
                <div className="flex-between">
                  <span 
                    style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => openClubModal({ id: event.clubId, name: event.clubName, logoUrl: event.clubLogoUrl })}
                  >
                    {event.clubName}
                  </span>
                </div>

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
                  <span className="badge badge-outline">
                    <Users size={12} /> {event.availableSeats} Seats
                  </span>
                  <Link to={`/events/${event.id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================================
          POPULAR CLUBS & STUDENT SOCIETIES
          ========================================================== */}
      <section className="container" style={{ marginBottom: '4.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <div>
            <span className="badge badge-accent">Host Organizations</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem' }}>
              Student Clubs &amp; Societies
            </h2>
          </div>
        </div>

        <div className="clubs-grid">
          {clubs.map((club) => (
            <div 
              key={club.id} 
              className="club-card"
              onClick={() => openClubModal(club)}
            >
              <img src={club.logoUrl} alt={club.name} className="club-card-logo" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                {club.name}
              </h3>
              <p className="text-muted" style={{ fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {club.description}
              </p>
              <span className="btn btn-sm btn-outline" style={{ pointerEvents: 'none' }}>
                View Profile &amp; Events
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================================
          LIVE PLATFORM STATISTICS (From Spring Boot / MySQL)
          ========================================================== */}
      <section className="container" style={{ marginBottom: '4.5rem' }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <span className="badge badge-primary">Database Persistence</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>
              Campus Events By The Numbers
            </h2>
            <p className="text-muted" style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Synchronized live with the Spring Boot JPA engine and college directory
            </p>
          </div>

          <div className="metrics-grid" style={{ marginBottom: 0 }}>
            <div className="metric-card">
              <div className="metric-icon-wrap">
                <Users size={26} />
              </div>
              <div>
                <div className="metric-val">{stats.totalStudents}</div>
                <div className="metric-lbl">Active Enrolled Students</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--secondary)' }}>
                <Calendar size={26} />
              </div>
              <div>
                <div className="metric-val">{stats.totalEvents}</div>
                <div className="metric-lbl">Scheduled College Events</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                <Ticket size={26} />
              </div>
              <div>
                <div className="metric-val">{stats.totalRegistrations}</div>
                <div className="metric-lbl">Event Passes Issued</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                <Building2 size={26} />
              </div>
              <div>
                <div className="metric-val">{stats.totalClubs}</div>
                <div className="metric-lbl">Partner Clubs &amp; Cells</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          HOW IT WORKS (3-STEP VISUAL WORKFLOW)
          ========================================================== */}
      <section className="container" style={{ marginBottom: '5rem' }}>
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <span className="badge badge-accent">Seamless Experience</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>
            How Campus Events Works
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontWeight: 800, fontSize: '1.25rem' }}>
              1
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Discover Events</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
              Filter by technical hackathons, entrepreneurship summits, sports meets or cultural nights with instant seat counts.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontWeight: 800, fontSize: '1.25rem' }}>
              2
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Get Digital QR Pass</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
              One-click registration verifies eligibility and generates a cryptographically signed QR pass saved in your student hub.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontWeight: 800, fontSize: '1.25rem' }}>
              3
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Check-in &amp; Review</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
              Scan your QR code at turnstiles for fast entry, receive attendance credit, and submit feedback ratings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Ticket({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
      <path d="M13 5v2"></path>
      <path d="M13 17v2"></path>
      <path d="M13 11v2"></path>
    </svg>
  );
}
