import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppFeatures } from '../context/AppFeaturesContext';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  Download, 
  Users, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Attendance() {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';
  const initialToken = searchParams.get('scanToken') || '';

  const { showToast } = useAppFeatures();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [attendances, setAttendances] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Scanner state
  const [qrTokenInput, setQrTokenInput] = useState(initialToken);
  const [remarksInput, setRemarksInput] = useState('Main Gate Turnstile 1');
  const [scanning, setScanning] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    async function loadEvents() {
      try {
        const evs = await api.getEvents();
        setEvents(evs || []);
        if (!selectedEventId && evs && evs.length > 0) {
          setSelectedEventId(String(evs[0].id));
        }
      } catch (e) {
        console.error('Events load error:', e);
      }
    }
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEventAttendance(selectedEventId);
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (initialToken) {
      setQrTokenInput(initialToken);
    }
  }, [initialToken]);

  const loadEventAttendance = async (eventId) => {
    setLoading(true);
    try {
      const [attData, regData] = await Promise.all([
        api.getEventAttendance(eventId),
        api.getEventRegistrations(eventId)
      ]);
      setAttendances(attData || []);
      setRegistrations(regData || []);
    } catch (err) {
      console.log('Attendance fetch note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async (e) => {
    if (e) e.preventDefault();
    if (!qrTokenInput.trim()) {
      showToast('Please enter or scan a valid QR token', 'warning');
      return;
    }

    setScanning(true);
    try {
      const result = await api.checkInAttendance({
        qrCodeToken: qrTokenInput.trim(),
        remarks: remarksInput
      });

      setLastCheckIn(result);
      showToast(`✓ Check-in Verified for ${result.studentName}!`, 'success');
      setQrTokenInput('');
      loadEventAttendance(selectedEventId);
    } catch (err) {
      showToast(err.message || 'Check-in validation failed', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await api.exportAttendanceCsv(selectedEventId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_event_${selectedEventId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Attendance CSV exported successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Export error', 'error');
    }
  };

  const selectedEvent = events.find(e => String(e.id) === String(selectedEventId));
  const attendedCount = attendances.length;
  const totalRegistered = registrations.length;
  const attendanceRate = totalRegistered > 0 ? Math.round((attendedCount / totalRegistered) * 100) : 0;

  const filteredAttendances = attendances.filter(a => {
    if (!filterSearch.trim()) return true;
    const q = filterSearch.toLowerCase();
    return a.studentName?.toLowerCase().includes(q) || a.studentRollNo?.toLowerCase().includes(q);
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <span className="badge badge-accent">Gate Turnstile Security</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem' }}>
            QR Attendance Scanner
          </h1>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            Verify cryptographic student QR passes in real time and record official attendance.
          </p>
        </div>

        <button 
          onClick={handleExportCsv} 
          className="btn btn-outline"
          disabled={attendances.length === 0}
        >
          <Download size={16} /> Export Attendance CSV
        </button>
      </div>

      {/* Event Selector & KPIs */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label className="input-label">Select Active Event</label>
            <select 
              className="input-field"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.eventDate} at {ev.venue})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flex: '1 1 300px', justifyContent: 'space-around', background: 'var(--bg-subtle)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{attendedCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Check-ins</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalRegistered}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Registrations</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{attendanceRate}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Turnout Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner & Table Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: QR Verification Scanner */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <QrCode size={22} className="text-primary" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Scan or Enter Pass Token</h3>
          </div>

          <form onSubmit={handleManualCheckIn}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="input-label">Pass QR Token (from student ticket)</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Paste token or scan QR: e.g. CE-..."
                value={qrTokenInput}
                onChange={(e) => setQrTokenInput(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label">Turnstile Gate Identifier</label>
              <input 
                type="text" 
                className="input-field" 
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={scanning || !qrTokenInput.trim()}
            >
              {scanning ? 'Verifying Token...' : 'Verify & Mark Present'}
            </button>
          </form>

          {/* Real-time Verification Feedback Card */}
          {lastCheckIn && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--success-bg)',
              border: '1px solid var(--success)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-text)', fontWeight: 700, marginBottom: '0.35rem' }}>
                <CheckCircle2 size={18} /> Check-in Granted!
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{lastCheckIn.studentName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--success-text)' }}>
                Roll No: {lastCheckIn.studentRollNo} &middot; Recorded at {lastCheckIn.checkInTime ? new Date(lastCheckIn.checkInTime).toLocaleTimeString() : 'Now'}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Verified Attendees List */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Live Check-in Roster ({attendances.length})
            </h3>

            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={14} className="text-muted" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search attendee..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                style={{ paddingLeft: '2rem', fontSize: '0.8rem', padding: '0.4rem 0.65rem 0.4rem 2rem' }}
              />
            </div>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '220px', borderRadius: 'var(--radius-md)' }}></div>
          ) : filteredAttendances.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '420px', overflowY: 'auto' }}>
              {filteredAttendances.map(att => (
                <div 
                  key={att.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.875rem' }}>{att.studentName}</strong>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {att.studentRollNo} &middot; {att.remarks || 'Turnstile Entry'}
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    <CheckCircle2 size={12} /> Present
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Users size={32} style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.875rem' }}>No student check-ins recorded yet for this event.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
