import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">EventSync</span>
            </Link>
            <p className="footer-tagline">Discover, book, and experience unforgettable events.</p>
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="Twitter"><FiTwitter size={18} /></a>
              <a href="#" className="social-link" aria-label="Instagram"><FiInstagram size={18} /></a>
              <a href="#" className="social-link" aria-label="GitHub"><FiGithub size={18} /></a>
              <a href="#" className="social-link" aria-label="Email"><FiMail size={18} /></a>
            </div>
          </div>
          <div className="footer-links-group">
            <h4>Platform</h4>
            <Link to="/events">Browse Events</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/dashboard">Organize Events</Link>
          </div>
          <div className="footer-links-group">
            <h4>Support</h4>
            <Link to="/about">About Us</Link>
            <Link to="#">Help Center</Link>
            <Link to="#">Contact Us</Link>
          </div>
          <div className="footer-links-group">
            <h4>Legal</h4>
            <Link to="#">Privacy Policy</Link>
            <Link to="#">Terms of Service</Link>
            <Link to="#">Cookie Policy</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 EventSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
