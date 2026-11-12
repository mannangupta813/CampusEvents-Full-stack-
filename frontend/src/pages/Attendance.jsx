import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Attendance() {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';
  const initialToken = searchParams.get('scanToken') || '';

  const { addToast } = useAuth();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [attendances, setAttendances] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Scanner state
  const [qrTokenInput, setQrTokenInput] = useState(initialToken);
  const [remarksInput, setRemarksInput] = useState('Entrance Gate Turnstile 1');
  const [scanning, setScanning] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState(null);

  // Search in table
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

  // If scanToken param was passed in URL, auto-fill it
  useEffect(() => {
    if (initialToken) {
      setQrTokenInput(initialToken);
    }
  }, [initialToken]);

  const loadEventAttendance = async (eventId) => {
    setLoading(true);
    try {
      const [attList, regList] = await Promise.all([
        api.getEventAttendance(eventId),
        api.getEventRegistrations(eventId)
      ]);
      setAttendances(attList || []);
      setRegistrations(regList || []);
    } catch (err) {
      console.log('Attendance data notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!qrTokenInput.trim()) {
      addToast('Please enter or scan a valid QR token.', 'warning');
      return;
    }

    setScanning(true);
    try {
      const result = await api.checkInAttendance({
        qrToken: qrTokenInput.trim(),
        eventId: Number(selectedEventId),
        checkinMethod: 'QR_SCAN',
        remarks: remarksInput
      });

      setLastCheckIn(result);
      addToast(`✓ Attendance marked for ${result.studentName}!`, 'success');
      setQrTokenInput('');
      loadEventAttendance(selectedEventId);
    } catch (err) {
      addToast(err.message || 'Check-in failed', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleManualCheckIn = async (regId, studentName) => {
    if (!window.confirm(`Manually mark attendance for ${studentName}?`)) return;

    try {
      const result = await api.checkInAttendance({
        registrationId: regId,
        eventId: Number(selectedEventId),
        checkinMethod: 'MANUAL',
        remarks: 'Manual organizer sign-in override'
      });
      setLastCheckIn(result);
      addToast(`✓ Attendance marked manually for ${studentName}!`, 'success');
      loadEventAttendance(selectedEventId);
    } catch (err) {
      addToast(err.message || 'Manual check-in failed', 'error');
    }
  };

  const handleExportCsv = async () => {
    if (!selectedEventId) return;
    try {
      const blob = await api.exportAttendanceCsv(selectedEventId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-event-${selectedEventId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast('Attendance CSV downloaded successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'CSV export failed', 'error');
    }
  };

  const currentEvent = events.find(e => String(e.id) === String(selectedEventId));
  const totalRegistered = registrations.length || (currentEvent?.totalRegistrations || 0);
  const totalAttended = attendances.length;
  const attendancePct = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

  // Filtered attendance list
  const filteredAttendances = attendances.filter(a => {
    if (!filterSearch.trim()) return true;
    const q = filterSearch.toLowerCase();
    return (
      a.studentName?.toLowerCase().includes(q) ||
      a.studentRollNo?.toLowerCase().includes(q) ||
      a.registrationNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container-wide">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-primary">Turnstile Operations</span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.4rem 0 0.25rem' }}>
              Attendance & QR Scanner
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Scan student digital passes in real-time, prevent duplicates, and export official check-in registers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={handleExportCsv} className="btn btn-secondary">
              📥 Export CSV Report
            </button>
            <Link to="/organizer" className="btn btn-outline">
              ← Organizer Hub
            </Link>
          </div>
        </div>

        {/* Event Selector & Live Stats */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Select Event for Attendance Tracking
              </label>
              <select 
                value={selectedEventId} 
                onChange={e => setSelectedEventId(e.target.value)}
                className="select-ctrl"
                style={{ width: '100%', fontSize: '1rem', padding: '0.75rem 1rem' }}
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} — {ev.eventDate} ({ev.venue})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalRegistered}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Registered</div>
              </div>
              <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>{totalAttended}</div>
                <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>Checked In</div>
              </div>
              <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>{attendancePct}%</div>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>Turnout Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scanner Simulation & Manual Entry Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Scanner Box */}
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.3rem' }}>📷</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>QR Code Scanner / Camera Input</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Scan the participant's QR pass or paste the secure pass token below to validate turnstile entry.
            </p>

            <form onSubmit={handleScanSubmit}>
              <div className="form-group">
                <label className="form-label">Scanned Pass Token / String</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. CEPASS-CODESPRINT2026-AARAV1045"
                    value={qrTokenInput}
                    onChange={e => setQrTokenInput(e.target.value)}
                    required
                  />
                  <button type="submit" disabled={scanning} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    {scanning ? 'Verifying...' : 'Validate Entry ✓'}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Checkpoint / Remarks</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={remarksInput}
                  onChange={e => setRemarksInput(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Real-time Verification Feedback Display */}
          <div style={{ background: lastCheckIn ? '#f0fdf4' : 'white', padding: '1.75rem', borderRadius: '20px', border: `1px solid ${lastCheckIn ? '#bbf7d0' : 'var(--border)'}`, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: lastCheckIn ? '#166534' : 'var(--text-main)' }}>
              {lastCheckIn ? '✓ Verified Turnstile Check-in' : 'Verification Status Monitor'}
            </h3>
            
            {lastCheckIn ? (
              <div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '1rem 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                    ✓
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{lastCheckIn.studentName}</h4>
                    <p style={{ color: '#15803d', fontSize: '0.85rem' }}>
                      Roll No: <strong>{lastCheckIn.studentRollNo}</strong> • {lastCheckIn.studentDepartment}
                    </p>
                  </div>
                </div>

                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #bbf7d0', fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div><strong>Pass ID:</strong> {lastCheckIn.registrationNumber}</div>
                  <div><strong>Method:</strong> {lastCheckIn.checkinMethod}</div>
                  <div><strong>Time:</strong> {new Date(lastCheckIn.checkedInAt).toLocaleTimeString()}</div>
                  <div><strong>Verifier:</strong> {lastCheckIn.checkedInByName}</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎟️</div>
                <p style={{ fontSize: '0.9rem' }}>
                  Ready to scan. Student details and entry validation status will appear here immediately upon scanning.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Registered Participants & Attendance Log */}
        <div className="table-card">
          <div className="table-header-row">
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Event Attendance Register</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Showing {filteredAttendances.length} checked-in participants
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Search by student name or roll..." 
                className="form-control"
                style={{ width: '260px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
              />
            </div>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Department</th>
                <th>Registration ID</th>
                <th>Check-in Time</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendances.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No check-in records found for this event yet.
                  </td>
                </tr>
              ) : (
                filteredAttendances.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{a.studentName}</div>
                    </td>
                    <td>{a.studentRollNo || '21BCS1045'}</td>
                    <td>{a.studentDepartment || 'CSE'}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{a.registrationNumber}</td>
                    <td>{new Date(a.checkedInAt).toLocaleTimeString()}</td>
                    <td>
                      <span className="badge badge-primary">{a.checkinMethod}</span>
                    </td>
                    <td>
                      <span className="badge badge-success">✓ Attended</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

