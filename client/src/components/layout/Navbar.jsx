import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiBell, FiUser, FiLogOut, FiGrid, FiChevronDown } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    ...(isAuthenticated && (user?.role === 'organizer' || user?.role === 'admin') ? [{ path: '/dashboard', label: 'Dashboard' }] : []),
    { path: '/about', label: 'About' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">EventSync</span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <button className="btn-icon nav-icon" onClick={() => navigate('/notifications')} aria-label="Notifications">
                <FiBell size={20} />
              </button>
              <div className="nav-profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="avatar-sm">{user?.name?.charAt(0).toUpperCase()}</div>
                <FiChevronDown size={14} />
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <p className="text-title-sm">{user?.name}</p>
                      <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>{user?.role}</p>
                    </div>
                    <Link to="/profile" className="dropdown-item"><FiUser size={16} /> Profile</Link>
                    {user?.role === 'admin' && <Link to="/admin" className="dropdown-item"><FiGrid size={16} /> Admin Panel</Link>}
                    <Link to="/bookings" className="dropdown-item"><FiGrid size={16} /> My Bookings</Link>
                    <button className="dropdown-item text-error" onClick={handleLogout}><FiLogOut size={16} /> Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
