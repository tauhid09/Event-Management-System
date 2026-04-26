import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiArrowRight, FiCalendar, FiUsers, FiZap, FiCheck } from 'react-icons/fi';
import EventCard from '../components/events/EventCard';
import { eventApi } from '../api';
import './Home.css';

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await eventApi.getAll({ limit: 4, sort: 'newest', status: 'published' });
        setFeaturedEvents(data.data.events);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        // Use placeholder data for demo
        setFeaturedEvents([
          { _id: '1', title: 'Neon Nights Music Festival', category: 'music', date: '2026-06-15', location: { city: 'Los Angeles' }, image: { url: '' }, ticketTypes: [{ price: 49, quantity: 500, quantitySold: 420 }] },
          { _id: '2', title: 'TechCon 2026 - AI Summit', category: 'tech', date: '2026-07-20', location: { city: 'San Francisco' }, image: { url: '' }, ticketTypes: [{ price: 199, quantity: 300, quantitySold: 250 }] },
          { _id: '3', title: 'Culinary Arts Festival', category: 'food', date: '2026-08-10', location: { city: 'New York' }, image: { url: '' }, ticketTypes: [{ price: 35, quantity: 200, quantitySold: 100 }] },
          { _id: '4', title: 'Urban Art Exhibition', category: 'arts', date: '2026-09-05', location: { city: 'Chicago' }, image: { url: '' }, ticketTypes: [{ price: 25, quantity: 150, quantitySold: 80 }] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/events?search=${searchQuery}`);
  };

  const stats = [
    { value: '10K+', label: 'Events Hosted', icon: <FiCalendar /> },
    { value: '50K+', label: 'Happy Users', icon: <FiUsers /> },
    { value: '100K+', label: 'Tickets Sold', icon: <FiZap /> },
  ];

  const steps = [
    { num: '01', title: 'Discover Events', desc: 'Browse through thousands of events across multiple categories and locations.' },
    { num: '02', title: 'Book Instantly', desc: 'Select your tickets, pay securely, and receive your QR code instantly.' },
    { num: '03', title: 'Experience', desc: 'Show your QR code at the venue and enjoy an unforgettable experience.' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-effects">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
        </div>
        <div className="container hero-content">
          <p className="hero-overline text-label-sm">YOUR EVENT PLATFORM</p>
          <h1 className="hero-title text-display-lg">
            <span className="text-gradient">Discover.</span> Book.{' '}
            <span className="text-gradient">Experience.</span>
          </h1>
          <p className="hero-subtitle">
            Your all-in-one platform for discovering events, booking tickets, and creating unforgettable experiences.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <FiSearch className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search events, categories, or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <div className="hero-ctas">
            <Link to="/events" className="btn btn-primary btn-lg">
              Explore Events <FiArrowRight />
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Become an Organizer
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card glass animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-icon">{stat.icon}</div>
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="text-label-sm" style={{ color: 'var(--primary)', marginBottom: 'var(--space-2)' }}>CURATED FOR YOU</p>
              <h2 className="text-headline-lg">Featured Events</h2>
            </div>
            <Link to="/events" className="btn btn-ghost">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="events-grid">
            {loading
              ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton event-skeleton"></div>)
              : featuredEvents.map((event) => <EventCard key={event._id} event={event} />)
            }
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <p className="text-label-sm" style={{ color: 'var(--tertiary)', marginBottom: 'var(--space-2)' }}>SIMPLE PROCESS</p>
              <h2 className="text-headline-lg">How It Works</h2>
            </div>
          </div>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div key={i} className="step-card animate-slideUp" style={{ animationDelay: `${i * 0.15}s` }}>
                <span className="step-num">{step.num}</span>
                <h3 className="text-title-lg">{step.title}</h3>
                <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card glass-heavy">
            <h2 className="text-headline-lg">Ready to Create Your Event?</h2>
            <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: '500px' }}>
              Join thousands of organizers. Create, manage, and grow your events with EventSync.
            </p>
            <div className="cta-features">
              {['Free to start', 'Secure payments', 'Real-time analytics'].map((f, i) => (
                <span key={i} className="cta-feature"><FiCheck size={16} color="var(--primary)" /> {f}</span>
              ))}
            </div>
            <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
