import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreateEvent() {
  const { addToast } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '1',
    clubId: '1',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&q=80',
    eventDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    eventTime: '10:00 AM',
    venue: 'Convention Center, Auditorium A',
    maxCapacity: 120,
    registrationDeadline: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    eligibility: 'All college students with valid student ID',
    rules: 'Arrive 15 minutes prior to start time with digital QR pass.'
  });

  useEffect(() => {
    async function loadOptions() {
      try {
        const [cats, clbs] = await Promise.all([
          api.getCategories(),
          api.getClubs()
        ]);
        setCategories(cats || []);
        setClubs(clbs || []);
        if (cats && cats.length > 0) setFormData(prev => ({ ...prev, categoryId: String(cats[0].id) }));
        if (clbs && clbs.length > 0) setFormData(prev => ({ ...prev, clubId: String(clbs[0].id) }));
      } catch (e) {
        console.error('Options error:', e);
      }
    }
    loadOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createEvent({
        ...formData,
        categoryId: Number(formData.categoryId),
        clubId: Number(formData.clubId),
        maxCapacity: Number(formData.maxCapacity)
      });
      addToast('Event created and published successfully!', 'success');
      navigate('/organizer');
    } catch (err) {
      addToast(err.message || 'Failed to create event', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/organizer" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
            ← Back to Organizer Hub
          </Link>
          <span className="badge badge-primary">Event Publishing</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.4rem 0 0.25rem' }}>
            Create New Campus Event
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Publish details, configure capacity limits, set registration deadlines, and open student reservations.
          </p>
        </div>

        <div className="form-card" style={{ maxWidth: '100%', margin: 0 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input 
                type="text" 
                name="title" 
                className="form-control" 
                placeholder="e.g. AI Innovation Summit 2026"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Event Category</label>
                <select 
                  name="categoryId" 
                  className="form-control"
                  value={formData.categoryId}
                  onChange={handleChange}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Organizing Club</label>
                <select 
                  name="clubId" 
                  className="form-control"
                  value={formData.clubId}
                  onChange={handleChange}
                >
                  {clubs.map(cl => (
                    <option key={cl.id} value={cl.id}>{cl.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Event Description</label>
              <textarea 
                name="description" 
                className="form-control" 
                rows="4"
                placeholder="Provide a comprehensive summary of what participants will experience, guest speakers, prizes, and schedule."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Event Date</label>
                <input 
                  type="date" 
                  name="eventDate" 
                  className="form-control" 
                  value={formData.eventDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Time</label>
                <input 
                  type="text" 
                  name="eventTime" 
                  className="form-control" 
                  placeholder="e.g. 10:00 AM"
                  value={formData.eventTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registration Deadline</label>
                <input 
                  type="date" 
                  name="registrationDeadline" 
                  className="form-control" 
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Venue Location</label>
                <input 
                  type="text" 
                  name="venue" 
                  className="form-control" 
                  placeholder="e.g. Main Auditorium & Tech Lab 4"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Max Seat Capacity</label>
                <input 
                  type="number" 
                  name="maxCapacity" 
                  className="form-control" 
                  min="1"
                  value={formData.maxCapacity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Banner Image URL</label>
              <input 
                type="url" 
                name="bannerUrl" 
                className="form-control" 
                value={formData.bannerUrl}
                onChange={handleChange}
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Preset: High-resolution Unsplash image link or cloud storage banner.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Eligibility Criteria</label>
              <input 
                type="text" 
                name="eligibility" 
                className="form-control" 
                value={formData.eligibility}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rules & Code of Conduct</label>
              <textarea 
                name="rules" 
                className="form-control" 
                rows="3"
                value={formData.rules}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                {loading ? 'Publishing Event...' : 'Publish Event to Campus'}
              </button>
              <Link to="/organizer" className="btn btn-secondary btn-lg">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
