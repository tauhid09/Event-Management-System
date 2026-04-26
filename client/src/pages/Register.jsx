import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'attendee' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-illustration">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-brand">
          <span className="logo-icon" style={{ fontSize: '3rem' }}>⚡</span>
          <h1 className="text-display-lg text-gradient">EventSync</h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: 360 }}>
            Join the community. Create or attend events that inspire.
          </p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="text-headline-lg">Create Account</h2>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>Start your EventSync journey</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input id="name" type="text" className="input-field" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="reg-email">Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input id="reg-email" type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="reg-password">Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input id="reg-password" type={showPassword ? 'text' : 'password'} className="input-field" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input id="confirm-password" type="password" className="input-field" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
            </div>
            <div className="input-group">
              <label>I want to</label>
              <div className="role-selector">
                <button type="button" className={`role-option ${form.role === 'attendee' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'attendee' })}>
                  🎫 Attend Events
                </button>
                <button type="button" className={`role-option ${form.role === 'organizer' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'organizer' })}>
                  🎪 Organize Events
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login" className="text-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
