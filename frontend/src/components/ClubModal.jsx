import React, { useEffect, useState } from 'react';
import { useAppFeatures } from '../context/AppFeaturesContext';
import { api } from '../services/api';
import { X, Calendar, MapPin, Users, ExternalLink, Sparkles, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClubModal() {
  const { activeClub, closeClubModal } = useAppFeatures();
  const [clubEvents, setClubEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeClub) return;
    
    let isMounted = true;
    const fetchClubEvents = async () => {
      setLoading(true);
      try {
        const events = await api.getEvents({ clubId: activeClub.id });
        if (isMounted) setClubEvents(events || []);
      } catch (err) {
        if (isMounted) setClubEvents([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClubEvents();
    return () => { isMounted = false; };
  }, [activeClub]);

  if (!activeClub) return null;

  return (
    <div className="modal-backdrop" onClick={closeClubModal}>
      <div className="modal-card club-modal" onClick={e => e.stopPropagation()}>
        {/* Banner Header */}
        <div className="club-modal-banner" style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.85)), url(${activeClub.bannerUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80'})`
        }}>
          <button className="modal-close-btn" onClick={closeClubModal} title="Close">
            <X size={18} />
          </button>
          <div className="club-modal-header-content">
            <img 
              src={activeClub.logoUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&q=80'} 
              alt={activeClub.name} 
              className="club-modal-logo"
            />
            <div>
              <div className="badge badge-accent">Official Student Organization</div>
              <h2 className="club-modal-title">{activeClub.name}</h2>
              <p className="club-modal-lead">
                <Users size={14} style={{ display: 'inline', marginRight: '4px' }} />
                President: {activeClub.leadUserName || 'Faculty Advisory Board'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="club-modal-body">
          <div className="club-modal-section">
            <h4 className="section-subtitle">About This Club</h4>
            <p className="club-description">{activeClub.description}</p>
          </div>

          <div className="club-modal-section">
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <h4 className="section-subtitle">Events by {activeClub.name}</h4>
              <span className="badge badge-outline">{clubEvents.length} Events</span>
            </div>

            {loading ? (
              <div className="skeleton-container">
                <div className="skeleton skeleton-card" style={{ height: '70px' }}></div>
                <div className="skeleton skeleton-card" style={{ height: '70px' }}></div>
              </div>
            ) : clubEvents.length > 0 ? (
              <div className="club-events-list">
                {clubEvents.map(event => (
                  <Link 
                    key={event.id} 
                    to={`/events/${event.id}`} 
                    onClick={closeClubModal}
                    className="club-event-item"
                  >
                    <img src={event.bannerUrl} alt={event.title} className="club-event-thumb" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 className="club-event-name">{event.title}</h5>
                      <div className="club-event-meta">
                        <span><Calendar size={12} /> {event.eventDate}</span>
                        <span><MapPin size={12} /> {event.venue}</span>
                      </div>
                    </div>
                    <div className="btn btn-sm btn-outline">View</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-subtle">
                <Calendar size={28} />
                <p>No upcoming events currently scheduled for this club.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
