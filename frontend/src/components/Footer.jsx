import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, Shield, Mail, Phone, MapPin, Sparkles, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ 
      backgroundColor: 'var(--bg-card)', 
      borderTop: '1px solid var(--border)', 
      padding: '4rem 0 2rem',
      marginTop: 'auto',
      transition: 'var(--transition)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Column */}
          <div>
            <div className="brand" style={{ marginBottom: '1rem' }}>
              <div className="brand-icon">
                <Calendar size={22} strokeWidth={2.5} />
              </div>
              <span>Campus<span className="brand-accent">Events</span></span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The unified event intelligence and ticketing ecosystem empowering campus clubs, tech societies, and student innovators.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-subtle)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
              Spring Boot & React REST Network: Operational
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/events" className="text-muted" style={{ transition: 'color 0.2s' }}>
                  Explore All Events
                </Link>
              </li>
              <li>
                <Link to="/my-registrations" className="text-muted" style={{ transition: 'color 0.2s' }}>
                  Student QR Passes
                </Link>
              </li>
              <li>
                <Link to="/organizer" className="text-muted" style={{ transition: 'color 0.2s' }}>
                  Club Organizer Hub
                </Link>
              </li>
              <li>
                <Link to="/attendance" className="text-muted" style={{ transition: 'color 0.2s' }}>
                  Turnstile QR Scanner
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-muted" style={{ transition: 'color 0.2s' }}>
                  Administration Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Event Verticals</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/events?category=1" className="text-muted">
                  Hackathons & Dev Sprints
                </Link>
              </li>
              <li>
                <Link to="/events?category=6" className="text-muted">
                  E-Summits & Pitch Days
                </Link>
              </li>
              <li>
                <Link to="/events?category=2" className="text-muted">
                  AI & Deep Tech Workshops
                </Link>
              </li>
              <li>
                <Link to="/events?category=5" className="text-muted">
                  Inter-Department Sports
                </Link>
              </li>
              <li>
                <Link to="/events?category=4" className="text-muted">
                  Cultural Nights & Indie Bands
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Support */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Student Affairs Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }} className="text-muted">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} className="text-primary" />
                <span>Student Activities Council, Block 4</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} className="text-primary" />
                <span>events@campusevents.edu</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} className="text-primary" />
                <span>+91 1800-CAMPUS-EVT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.825rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; 2026 Campus Events System &middot; Academic Full-Stack Web Development Project
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Powered by React 18, Spring Boot 3 &amp; MySQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
