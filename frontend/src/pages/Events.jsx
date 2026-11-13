import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAppFeatures } from '../context/AppFeaturesContext';
import CalendarView from '../components/CalendarView';
import { 
  Search, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Users, 
  Filter, 
  LayoutGrid, 
  CalendarDays, 
  Heart, 
  Share2, 
  Building2, 
  ArrowUpDown, 
  Check, 
  Sparkles, 
  Flame, 
  X,
  RotateCcw
} from 'lucide-react';

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('categoryId') || 'All';

  const { wishlist, toggleWishlist, isWishlisted, openClubModal, shareEvent } = useAppFeatures();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // View state: 'grid' or 'calendar'
  const [activeView, setActiveView] = useState('grid');

  // Filter state
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedClub, setSelectedClub] = useState('All');
  const [selectedVenue, setSelectedVenue] = useState('All');
  const [dateFilter, setDateFilter] = useState('all'); // all, upcoming, this-month
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('date-asc'); // date-asc, popular, name

  useEffect(() => {
    if (urlSearch) setSearchTerm(urlSearch);
    if (urlCategory) setSelectedCategory(urlCategory);
  }, [urlSearch, urlCategory]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [eventsData, catData, clubsData] = await Promise.all([
          api.getEvents(),
          api.getCategories(),
          api.getClubs()
        ]);
        setEvents(eventsData || []);
        setCategories(catData || []);
        setClubs(clubsData || []);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Unique venues for venue filter
  const venues = useMemo(() => {
    const set = new Set();
    events.forEach(e => {
      if (e.venue) set.add(e.venue);
    });
    return Array.from(set);
  }, [events]);

  // Reset Filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedClub('All');
    setSelectedVenue('All');
    setDateFilter('all');
    setOnlyAvailable(false);
    setSortBy('date-asc');
    setSearchParams({});
  };

  // Filter & Sort
  const filteredEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return events
      .filter(event => {
        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = event.title?.toLowerCase().includes(q);
          const matchDesc = event.description?.toLowerCase().includes(q);
          const matchVenue = event.venue?.toLowerCase().includes(q);
          const matchClub = event.clubName?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchVenue && !matchClub) return false;
        }

        // Category
        if (selectedCategory !== 'All') {
          if (String(event.categoryId) !== String(selectedCategory) && event.categoryName !== selectedCategory) {
            return false;
          }
        }

        // Club
        if (selectedClub !== 'All') {
          if (String(event.clubId) !== String(selectedClub) && event.clubName !== selectedClub) {
            return false;
          }
        }

        // Venue
        if (selectedVenue !== 'All') {
          if (event.venue !== selectedVenue) return false;
        }

        // Date Filter
        if (dateFilter === 'upcoming') {
          if (event.eventDate < today) return false;
        }

        // Available seats only
        if (onlyAvailable) {
          if (event.availableSeats <= 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-asc') {
          return (a.eventDate || '').localeCompare(b.eventDate || '');
        }
        if (sortBy === 'popular') {
          return (b.totalRegistrations || 0) - (a.totalRegistrations || 0);
        }
        if (sortBy === 'name') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
      });
  }, [events, searchTerm, selectedCategory, selectedClub, selectedVenue, dateFilter, onlyAvailable, sortBy]);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header and View Mode Switcher */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-primary">University Event Directory</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem' }}>
            Explore Campus Events
          </h1>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            Discover workshops, hackathons, sports championships, and cultural festivals.
          </p>
        </div>

        {/* View Mode Toggle: Grid vs Calendar */}
        <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActiveView('grid')}
            className={`btn btn-sm ${activeView === 'grid' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            <LayoutGrid size={15} /> Grid View
          </button>
          <button 
            onClick={() => setActiveView('calendar')}
            className={`btn btn-sm ${activeView === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            <CalendarDays size={15} /> Monthly Calendar
          </button>
        </div>
      </div>

      {/* ==========================================================
          SMART FILTER BAR
          ========================================================== */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem 1.5rem',
        marginBottom: '2.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Row 1: Search + Quick Category Tabs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search by name, venue, speaker or club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`badge ${selectedCategory === 'All' ? 'badge-primary' : 'badge-outline'}`}
              style={{ cursor: 'pointer', padding: '0.5rem 0.85rem' }}
            >
              All Verticals
            </button>
            {categories.slice(0, 6).map(c => (
              <button 
                key={c.id}
                onClick={() => setSelectedCategory(String(c.id))}
                className={`badge ${String(selectedCategory) === String(c.id) ? 'badge-primary' : 'badge-outline'}`}
                style={{ cursor: 'pointer', padding: '0.5rem 0.85rem' }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Secondary Filters (Venue, Club, Date, Availability, Sort) */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.85rem' }}>
          {/* Club Dropdown */}
          <select 
            className="input-field" 
            style={{ width: 'auto', padding: '0.45rem 0.85rem' }}
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
          >
            <option value="All">All Clubs &amp; Cells</option>
            {clubs.map(club => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>

          {/* Venue Dropdown */}
          <select 
            className="input-field" 
            style={{ width: 'auto', padding: '0.45rem 0.85rem' }}
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
          >
            <option value="All">All Campus Venues</option>
            {venues.map((v, i) => (
              <option key={i} value={v}>{v}</option>
            ))}
          </select>

          {/* Sort By */}
          <select 
            className="input-field" 
            style={{ width: 'auto', padding: '0.45rem 0.85rem' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-asc">Soonest Date First</option>
            <option value="popular">Most Popular (Registrations)</option>
            <option value="name">Alphabetical (A - Z)</option>
          </select>

          {/* Available Seats Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}>
            <input 
              type="checkbox" 
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
            <span>Available Seats Only</span>
          </label>

          {/* Active Filter Clear */}
          {(searchTerm || selectedCategory !== 'All' || selectedClub !== 'All' || selectedVenue !== 'All' || onlyAvailable) && (
            <button 
              onClick={resetFilters} 
              className="btn btn-sm btn-outline"
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ==========================================================
          CALENDAR VIEW MODE
          ========================================================== */}
      {activeView === 'calendar' ? (
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Monthly Event Schedule ({filteredEvents.length} events)
            </h3>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              Click any colored event chip to inspect details or register
            </span>
          </div>
          <CalendarView events={filteredEvents} />
        </div>
      ) : (
        /* ==========================================================
            GRID VIEW MODE
            ========================================================== */
        <div>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredEvents.length}</strong> campus events
            </div>
          </div>

          {loading ? (
            <div className="events-grid">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="skeleton" style={{ height: '360px' }}></div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map(event => {
                const isTrending = (event.totalRegistrations / event.maxCapacity) >= 0.5 || event.totalRegistrations > 1;

                return (
                  <div key={event.id} className="event-card">
                    <div className="event-card-img-wrap">
                      <img src={event.bannerUrl} alt={event.title} className="event-card-img" />
                      
                      {/* Wishlist Heart Button */}
                      <button 
                        onClick={() => toggleWishlist(event)} 
                        className={`card-wishlist-btn ${isWishlisted(event.id) ? 'active' : ''}`}
                        title={isWishlisted(event.id) ? 'Remove from Saved' : 'Save to Wishlist'}
                      >
                        <Heart size={16} fill={isWishlisted(event.id) ? '#ffffff' : 'none'} />
                      </button>

                      {/* Trending Ribbon */}
                      {isTrending && (
                        <span className="badge badge-trending" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                          <Flame size={12} /> Trending
                        </span>
                      )}

                      <span className="badge badge-accent" style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                        {event.categoryName}
                      </span>
                    </div>

                    <div className="event-card-body">
                      {/* Club Host */}
                      <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
                        <span 
                          style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => openClubModal({ id: event.clubId, name: event.clubName, logoUrl: event.clubLogoUrl })}
                          title="Click to view club profile"
                        >
                          <Building2 size={12} />
                          <strong>{event.clubName}</strong>
                        </span>

                        <button 
                          onClick={() => shareEvent(event)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          title="Share event link"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>

                      <h3 className="event-card-title">{event.title}</h3>
                      <p className="event-card-desc">{event.description}</p>

                      <div className="event-meta-row">
                        <div className="event-meta-item">
                          <CalendarIcon size={14} className="text-primary" />
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

                      {/* Capacity Progress Bar */}
                      <div className="seat-progress-container">
                        <div className="seat-progress-labels">
                          <span>Capacity</span>
                          <span className="text-primary">
                            {event.availableSeats} / {event.maxCapacity} seats left
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
                          Closes: {event.registrationDeadline}
                        </span>
                        <Link to={`/events/${event.id}`} className="btn btn-primary btn-sm">
                          Register Now
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '4rem 2rem',
              textAlign: 'center'
            }}>
              <CalendarIcon size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Events Match Your Filters</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
                Try adjusting your search query, selecting different categories, or resetting active filters.
              </p>
              <button onClick={resetFilters} className="btn btn-primary btn-sm">
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
