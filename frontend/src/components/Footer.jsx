import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '4rem 0 2rem', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1rem' }}>
              <span style={{ color: '#818cf8' }}>●</span> Campus Events
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#cbd5e1' }}>
              Discover. Register. Experience Campus. The unified college event lifecycle management and QR pass check-in platform.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Discover
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              <li><Link to="/events?category=Hackathons" style={{ color: '#94a3b8' }}>Hackathons</Link></li>
              <li><Link to="/events?category=Workshops" style={{ color: '#94a3b8' }}>Workshops</Link></li>
              <li><Link to="/events?category=Cultural" style={{ color: '#94a3b8' }}>Cultural Fests</Link></li>
              <li><Link to="/events?category=Sports" style={{ color: '#94a3b8' }}>Sports Leagues</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Portals
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              <li><Link to="/my-registrations" style={{ color: '#94a3b8' }}>Student Dashboard</Link></li>
              <li><Link to="/organizer" style={{ color: '#94a3b8' }}>Organizer Hub</Link></li>
              <li><Link to="/attendance" style={{ color: '#94a3b8' }}>QR Pass Scanner</Link></li>
              <li><Link to="/admin" style={{ color: '#94a3b8' }}>Administrative Console</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Course Information
            </h4>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#cbd5e1' }}>
              Full Stack Web Development Capstone Project.<br />
              <strong>Frontend:</strong> React.js & React Router<br />
              <strong>Backend:</strong> Java Spring Boot 3 & Security<br />
              <strong>Database:</strong> MySQL 8.0 & Hibernate
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <div>&copy; 2026 Campus Events. Student Activities Council. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Built with Spring Boot & React</span>
            <span>RESTful Micro-Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
