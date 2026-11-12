import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedClub, setSelectedClub] = useState('All');
  const [timeFilter, setTimeFilter] = useState('all'); // all, upcoming, past
  const [sortBy, setSortBy] = useState('date-asc'); // date-asc, date-desc, name

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

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

  // Filter and Sort in useMemo for lightning speed
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(query);
        const matchDesc = event.description.toLowerCase().includes(query);
        const matchVenue = event.venue.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchVenue) return false;
      }

      // Category
      if (selectedCategory !== 'All') {
        if (event.categoryName !== selectedCategory) return false;
      }

      // Club
      if (selectedClub !== 'All') {
        if (String(event.clubId) !== String(selectedClub)) return false;
      }

      // Time filter
      const eventDate = new Date(event.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (timeFilter === 'upcoming' && eventDate < today) return false;
      if (timeFilter === 'past' && eventDate >= today) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.eventDate) - new Date(b.eventDate);
      } else if (sortBy === 'date-desc') {
        return new Date(b.eventDate) - new Date(a.eventDate);
      } else if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [events, searchTerm, selectedCategory, selectedClub, timeFilter, sortBy]);

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    if (catName === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catName);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span className="badge badge-primary">Catalog</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.4rem 0 0.5rem', color: 'var(--text-main)' }}>
            Discover Campus Events
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Explore technical hackathons, entrepreneurship summits, workshops, and sports matches organized by college clubs.
          </p>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          <button 
            onClick={() => handleCategorySelect('All')}
            className={`pill-btn ${selectedCategory === 'All' ? 'active' : ''}`}
          >
            All Categories ({events.length})
          </button>
          {categories.map(c => (
            <button 
              key={c.id}
              onClick={() => handleCategorySelect(c.name)}
              className={`pill-btn ${selectedCategory === c.name ? 'active' : ''}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search & Filters Control Bar */}
        <div className="filters-bar">
          <div className="search-input-group">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by event name, description, venue..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            {/* Club Filter */}
            <select 
              value={selectedClub} 
              onChange={e => setSelectedClub(e.target.value)}
              className="select-ctrl"
            >
              <option value="All">All Organizing Clubs</option>
              {clubs.map(cl => (
                <option key={cl.id} value={cl.id}>{cl.name}</option>
              ))}
            </select>

            {/* Time Filter */}
            <select 
              value={timeFilter} 
              onChange={e => setTimeFilter(e.target.value)}
              className="select-ctrl"
            >
              <option value="all">All Dates</option>
              <option value="upcoming">Upcoming Events Only</option>
              <option value="past">Past Events</option>
            </select>

            {/* Sorting */}
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="select-ctrl"
            >
              <option value="date-asc">Sort: Earliest Date</option>
              <option value="date-desc">Sort: Latest Date</option>
              <option value="name">Sort: Event Title (A-Z)</option>
            </select>

            {(searchTerm || selectedCategory !== 'All' || selectedClub !== 'All' || timeFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  handleCategorySelect('All');
                  setSelectedClub('All');
                  setTimeFilter('all');
                }}
                className="btn btn-secondary btn-sm"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Showing <strong>{filteredEvents.length}</strong> events
          </span>
        </div>

        {/* Events Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            Loading campus events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', background: 'white', padding: '4rem 2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No events found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Try adjusting your search criteria or switching to all categories.
            </p>
            <button onClick={() => { setSearchTerm(''); handleCategorySelect('All'); }} className="btn btn-primary">
              View All Events
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map(event => {
              const isPast = new Date(event.eventDate) < new Date();
              const isFull = event.availableSeats <= 0;

              return (
                <div key={event.id} className="event-card">
                  <div className="event-banner">
                    <img 
                      src={event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'} 
                      alt={event.title} 
                    />
                    <span className="event-category-chip">{event.categoryName || 'General'}</span>
                  </div>
                  <div className="event-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>
                        {event.clubName || 'College Club'}
                      </span>
                      {event.isRegisteredByCurrentUser ? (
                        <span className="badge badge-success">Registered</span>
                      ) : isFull ? (
                        <span className="badge badge-danger">Sold Out</span>
                      ) : isPast ? (
                        <span className="badge badge-warning">Past Event</span>
                      ) : (
                        <span className="badge badge-primary">{event.availableSeats} left</span>
                      )}
                    </div>

                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-desc">{event.description}</p>

                    <div className="event-meta">
                      <div className="meta-row">
                        <span className="meta-item">📅 {event.eventDate}</span>
                        <span className="meta-item">⏰ {event.eventTime}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-item">📍 {event.venue}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Deadline: {event.registrationDeadline}
                        </span>
                      </div>
                    </div>

                    <div className="event-card-actions">
                      <Link to={`/events/${event.id}`} className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                      <Link 
                        to={`/events/${event.id}`} 
                        className={`btn btn-sm ${event.isRegisteredByCurrentUser ? 'btn-secondary' : 'btn-primary'}`}
                      >
                        {event.isRegisteredByCurrentUser ? 'View Pass' : isFull ? 'Event Full' : 'Register Now'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
