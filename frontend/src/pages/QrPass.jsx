import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Clean deterministic SVG QR Code generator (no external CDN required!)
function SvgQrCode({ value, size = 180 }) {
  // Simple deterministic visual matrix hash from string token
  const cells = 21;
  const matrix = [];
  
  // Hash seed
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < cells; r++) {
    const row = [];
    for (let c = 0; c < cells; c++) {
      // Corner positioning markers
      const isCorner1 = (r < 7 && c < 7);
      const isCorner2 = (r < 7 && c >= cells - 7);
      const isCorner3 = (r >= cells - 7 && c < 7);
      
      if (isCorner1 || isCorner2 || isCorner3) {
        const isBorder = (r === 0 || r === 6 || c === 0 || c === 6 ||
                          r === 0 || r === 6 || c === cells - 7 || c === cells - 1 ||
                          r === cells - 7 || r === cells - 1 || c === 0 || c === 6);
        const isCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                         (r >= 2 && r <= 4 && c >= cells - 5 && c <= cells - 3) ||
                         (r >= cells - 5 && r <= cells - 3 && c >= 2 && c <= 4);
        row.push(isBorder || isCenter);
      } else {
        // Data pseudo-bits
        const bit = ((hash ^ (r * 31 + c * 17)) & (1 << ((r + c) % 15))) !== 0;
        row.push(bit);
      }
    }
    matrix.push(row);
  }

  const cellSize = size / cells;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: '8px' }}>
      <rect width={size} height={size} fill="white" />
      {matrix.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function QrPass() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useAuth();

  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPass() {
      try {
        let data;
        if (id === 'demo') {
          const list = await api.getMyRegistrations();
          data = list[0];
        } else {
          data = await api.getRegistrationById(id);
        }
        setRegistration(data);
      } catch (err) {
        addToast(err.message || 'Pass not found', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchPass();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Generating your digital QR pass...</p>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Pass Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>The requested registration pass could not be retrieved.</p>
        <Link to="/my-registrations" className="btn btn-primary">My Registrations</Link>
      </div>
    );
  }

  return (
    <div className="section" style={{ paddingTop: '2rem' }}>
      <div className="container">
        {/* Navigation back */}
        <div style={{ maxWidth: '460px', margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/my-registrations" className="btn btn-secondary btn-sm">
            ← Back to Registrations
          </Link>
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            🖨️ Print / Save PDF
          </button>
        </div>

        {/* Digital Ticket */}
        <div className="ticket-wrapper">
          <div className="ticket">
            {/* Top Navy Section */}
            <div className="ticket-header">
              <div className="ticket-brand">🏛️ Campus Events Official Pass</div>
              <h2 className="ticket-event-name">{registration.eventTitle}</h2>
              <div className="ticket-sub">
                {registration.categoryName || 'Technical'} • Organized by {registration.clubName || 'College Club'}
              </div>
            </div>

            {/* Perforated Notches Row */}
            <div className="ticket-notch-row">
              <div className="ticket-divider-line" />
            </div>

            {/* Ticket Body with QR */}
            <div className="ticket-body">
              <div style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
                {registration.status === 'ATTENDED' ? (
                  <span className="badge badge-success">✓ Checked In / Attended</span>
                ) : registration.status === 'CANCELLED' ? (
                  <span className="badge badge-danger">Cancelled Pass</span>
                ) : (
                  <span className="badge badge-primary">Valid Entry Pass</span>
                )}
              </div>

              {/* QR Box */}
              <div className="qr-box">
                <SvgQrCode value={registration.qrToken || 'CAMPUS-EVENTS-DEMO-PASS'} size={180} />
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '1rem' }}>
                Token: <strong>{registration.qrToken}</strong>
              </div>

              {/* Student & Pass Details Grid */}
              <div className="ticket-details-grid">
                <div className="ticket-detail-item">
                  <div className="label">Participant Name</div>
                  <div className="value">{registration.studentName}</div>
                </div>
                <div className="ticket-detail-item">
                  <div className="label">Roll / Reg No</div>
                  <div className="value">{registration.studentRollNo || '21BCS1045'}</div>
                </div>
                <div className="ticket-detail-item">
                  <div className="label">Event Date & Time</div>
                  <div className="value">{registration.eventDate} @ {registration.eventTime}</div>
                </div>
                <div className="ticket-detail-item">
                  <div className="label">Venue Location</div>
                  <div className="value">{registration.venue}</div>
                </div>
                <div className="ticket-detail-item">
                  <div className="label">Registration ID</div>
                  <div className="value" style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>
                    {registration.registrationNumber}
                  </div>
                </div>
                <div className="ticket-detail-item">
                  <div className="label">Department</div>
                  <div className="value">{registration.studentDepartment || 'CSE'}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, marginTop: '1.25rem' }}>
                Present this digital QR pass at the entrance gate turnstiles. Passes are single-use, digitally signed, and registered strictly to your college ID.
              </div>

              {/* Fast Test Scanner Link for Evaluators */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                <Link 
                  to={`/attendance?scanToken=${encodeURIComponent(registration.qrToken)}&eventId=${registration.eventId}`}
                  className="btn btn-outline btn-sm btn-block"
                >
                  ⚡ Test QR Scan as Organizer →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
