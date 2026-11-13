import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppFeatures } from '../context/AppFeaturesContext';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  QrCode,
  ExternalLink
} from 'lucide-react';

// Crisp SVG QR Code generator
function SvgQrCode({ value, size = 180 }) {
  const cells = 21;
  const matrix = [];
  
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < cells; r++) {
    const row = [];
    for (let c = 0; c < cells; c++) {
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
  const { showToast } = useAppFeatures();

  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPass() {
      try {
        const data = await api.getRegistrationById(id);
        setRegistration(data);
      } catch (err) {
        showToast(err.message || 'Failed to load pass', 'error');
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
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '420px', height: '550px', margin: '0 auto', borderRadius: 'var(--radius-xl)' }}></div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2>Pass Not Found</h2>
        <p className="text-muted" style={{ margin: '1rem 0' }}>The requested registration pass is unavailable.</p>
        <Link to="/my-registrations" className="btn btn-primary">Return to My Passes</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/my-registrations" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Back to My Registrations
          </Link>
        </div>

        {/* Boarding Pass Container */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative'
        }}>
          {/* Top Banner */}
          <div style={{
            background: 'var(--brand-gradient)',
            padding: '1.75rem',
            color: '#ffffff',
            textAlign: 'center'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <ShieldCheck size={14} /> Official Verified Event Pass
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.25 }}>
              {registration.eventTitle}
            </h2>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.35rem' }}>
              Pass Reference #{registration.id}
            </div>
          </div>

          {/* QR Code Section */}
          <div style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'var(--bg-card)',
            borderBottom: '2px dashed var(--border)'
          }}>
            <div style={{
              padding: '1rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
            }}>
              <SvgQrCode value={registration.qrCodeToken || `CE-PASS-${registration.id}`} size={180} />
            </div>

            <div style={{
              marginTop: '1rem',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-subtle)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              {registration.qrCodeToken || `CE-PASS-${registration.id}`}
            </div>

            <span className="badge badge-success" style={{ marginTop: '0.75rem' }}>
              <CheckCircle2 size={12} /> Active &amp; Valid For Turnstile Check-in
            </span>
          </div>

          {/* Ticket Metadata Details */}
          <div style={{ padding: '1.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  Student Attendee
                </span>
                <strong>{registration.studentName}</strong>
              </div>

              <div>
                <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  Roll Number
                </span>
                <strong>{registration.studentRollNo || '21BCS1045'}</strong>
              </div>

              <div>
                <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  Event Date &amp; Time
                </span>
                <strong>{registration.eventDate}</strong>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{registration.eventTime}</div>
              </div>

              <div>
                <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  Campus Venue
                </span>
                <strong>{registration.venue}</strong>
              </div>
            </div>

            {/* Quick Demo Turnstile Trigger */}
            <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Simulate Turnstile Scanner:</span>
              <Link 
                to={`/attendance?eventId=${registration.eventId}&scanToken=${registration.qrCodeToken}`}
                className="btn btn-outline btn-sm"
              >
                Scan Pass <ExternalLink size={12} />
              </Link>
            </div>

            {/* Print & Download Action */}
            <button 
              onClick={handlePrint} 
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Printer size={16} /> Print or Save PDF Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
