import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (res.role === 'ROLE_ORGANIZER') {
        navigate('/organizer');
      } else {
        navigate(redirect === '/' ? '/my-registrations' : redirect);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="section" style={{ minHeight: 'calc(100vh - 150px)', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="form-card" style={{ maxWidth: '100%', margin: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-primary">Campus Events Portal</span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Sign in to manage registrations and access event passes.
            </p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '10px', color: '#991b1b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">College Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="student@campusevents.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Authenticating...' : 'Sign In to Campus Events'}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center' }}>
              Academic Review Quick Accounts
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => handleQuickLogin('student@campusevents.edu', 'Student@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.4rem' }}
              >
                🎓 Student
              </button>
              <button 
                type="button" 
                onClick={() => handleQuickLogin('organizer@campusevents.edu', 'Organizer@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.4rem' }}
              >
                🎪 Organizer
              </button>
              <button 
                type="button" 
                onClick={() => handleQuickLogin('admin@campusevents.edu', 'Admin@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.4rem' }}
              >
                ⚡ Admin
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
