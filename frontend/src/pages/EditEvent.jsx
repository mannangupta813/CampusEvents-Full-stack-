import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useAuth();

  const [categories, setCategories] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '1',
    clubId: '1',
    bannerUrl: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    maxCapacity: 100,
    registrationDeadline: '',
    eligibility: '',
    rules: '',
    isPublished: true,
    isCancelled: false
  });

  useEffect(() => {
    async function init() {
      try {
        const [eventData, cats, clbs] = await Promise.all([
          api.getEventById(id),
          api.getCategories(),
          api.getClubs()
        ]);
        setCategories(cats || []);
        setClubs(clbs || []);
        if (eventData) {
          setFormData({
            title: eventData.title || '',
            description: eventData.description || '',
            categoryId: String(eventData.categoryId || '1'),
            clubId: String(eventData.clubId || '1'),
            bannerUrl: eventData.bannerUrl || '',
            eventDate: eventData.eventDate || '',
            eventTime: eventData.eventTime || '',
            venue: eventData.venue || '',
            maxCapacity: eventData.maxCapacity || 100,
            registrationDeadline: eventData.registrationDeadline || '',
            eligibility: eventData.eligibility || '',
            rules: eventData.rules || '',
            isPublished: eventData.isPublished !== undefined ? eventData.isPublished : true,
            isCancelled: eventData.isCancelled !== undefined ? eventData.isCancelled : false
          });
        }
      } catch (err) {
        addToast(err.message || 'Failed to load event', 'error');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateEvent(id, {
        ...formData,
        categoryId: Number(formData.categoryId),
        clubId: Number(formData.clubId),
        maxCapacity: Number(formData.maxCapacity)
      });
      addToast('Event updated successfully!', 'success');
      navigate('/organizer');
    } catch (err) {
      addToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading event configuration...</p>
      </div>
    );
  }

  return (
    <div className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/organizer" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
            ← Back to Organizer Hub
          </Link>
          <span className="badge badge-primary">Event Management</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.4rem 0 0.25rem' }}>
            Edit Event: {formData.title}
          </h1>
        </div>

        <div className="form-card" style={{ maxWidth: '100%', margin: 0 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input 
                type="text" 
                name="title" 
                className="form-control" 
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
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
                <label className="form-label">Club</label>
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
              <label className="form-label">Description</label>
              <textarea 
                name="description" 
                className="form-control" 
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Date</label>
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
                <label className="form-label">Time</label>
                <input 
                  type="text" 
                  name="eventTime" 
                  className="form-control" 
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
                  value={formData.venue}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Maximum Capacity</label>
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
              <label className="form-label">Banner URL</label>
              <input 
                type="url" 
                name="bannerUrl" 
                className="form-control" 
                value={formData.bannerUrl}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '2rem', margin: '1.5rem 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="isPublished" 
                  checked={formData.isPublished}
                  onChange={handleChange}
                />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Publicly Published</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="isCancelled" 
                  checked={formData.isCancelled}
                  onChange={handleChange}
                />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#dc2626' }}>Mark as Cancelled</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                {saving ? 'Saving Changes...' : 'Save Changes'}
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
