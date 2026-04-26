import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
            Discover amazing events, book tickets instantly, and create unforgettable memories.
          </p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="text-headline-lg">Welcome Back</h2>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>Sign in to continue to EventSync</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input id="email" type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input id="password" type={showPassword ? 'text' : 'password'} className="input-field" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <div className="auth-options">
              <label className="checkbox-label">
                <input type="checkbox" /> <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-link">Forgot password?</Link>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="auth-switch">
            Don't have an account? <Link to="/register" className="text-link">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
