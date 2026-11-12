import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    rollNo: '',
    department: 'Computer Science & Engineering',
    yearOfStudy: 3,
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        fullName: formData.fullName,
        email: formData.email,
        rollNo: formData.rollNo,
        department: formData.department,
        yearOfStudy: Number(formData.yearOfStudy),
        password: formData.password,
        role: formData.role,
        phone: formData.phone
      });

      if (res.role === 'ROLE_ORGANIZER') {
        navigate('/organizer');
      } else {
        navigate('/my-registrations');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: 'calc(100vh - 150px)', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="form-card" style={{ maxWidth: '100%', margin: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-primary">Student & Organizer Onboarding</span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>Create Account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Join the campus events network and reserve passes in seconds.
            </p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '10px', color: '#991b1b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                name="fullName" 
                className="form-control" 
                placeholder="Aarav Sharma"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">College Email</label>
                <input 
                  type="email" 
                  name="email" 
                  className="form-control" 
                  placeholder="student@campusevents.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registration / Roll No</label>
                <input 
                  type="text" 
                  name="rollNo" 
                  className="form-control" 
                  placeholder="21BCS1045"
                  value={formData.rollNo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <select 
                  name="department" 
                  className="form-control"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Management Studies / MBA">Management Studies / MBA</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Year of Study</label>
                <select 
                  name="yearOfStudy" 
                  className="form-control"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: formData.role === 'STUDENT' ? 'var(--primary-light)' : 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '10px', border: `1px solid ${formData.role === 'STUDENT' ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="STUDENT" 
                    checked={formData.role === 'STUDENT'} 
                    onChange={handleChange} 
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Student</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Browse & attend events</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: formData.role === 'ORGANIZER' ? 'var(--primary-light)' : 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '10px', border: `1px solid ${formData.role === 'ORGANIZER' ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="ORGANIZER" 
                    checked={formData.role === 'ORGANIZER'} 
                    onChange={handleChange} 
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Club Organizer</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Host & scan attendance</div>
                  </div>
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  className="form-control" 
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  className="form-control" 
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
