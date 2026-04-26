import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiGrid, FiList, FiX } from 'react-icons/fi';
import EventCard from '../components/events/EventCard';
import { eventApi } from '../api';
import './Events.css';

const categories = ['all', 'music', 'tech', 'sports', 'arts', 'food', 'business', 'other'];

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('date_asc');
  const [viewMode, setViewMode] = useState('grid');

  const fetchEvents = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      const { data } = await eventApi.getAll(params);
      setEvents(data.data.events);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      // Demo data
      setEvents([
        { _id: '1', title: 'Neon Nights Music Festival', category: 'music', date: '2026-06-15', location: { city: 'Los Angeles' }, image: { url: '' }, ticketTypes: [{ price: 49, quantity: 500, quantitySold: 420 }] },
        { _id: '2', title: 'TechCon 2026 - AI Summit', category: 'tech', date: '2026-07-20', location: { city: 'San Francisco' }, image: { url: '' }, ticketTypes: [{ price: 199, quantity: 300, quantitySold: 250 }] },
        { _id: '3', title: 'Culinary Arts Festival', category: 'food', date: '2026-08-10', location: { city: 'New York' }, image: { url: '' }, ticketTypes: [{ price: 35, quantity: 200, quantitySold: 100 }] },
        { _id: '4', title: 'Urban Art Exhibition', category: 'arts', date: '2026-09-05', location: { city: 'Chicago' }, image: { url: '' }, ticketTypes: [{ price: 25, quantity: 150, quantitySold: 80 }] },
        { _id: '5', title: 'Marathon 2026', category: 'sports', date: '2026-10-12', location: { city: 'Boston' }, image: { url: '' }, ticketTypes: [{ price: 75, quantity: 1000, quantitySold: 600 }] },
        { _id: '6', title: 'Business Networking Gala', category: 'business', date: '2026-11-18', location: { city: 'Miami' }, image: { url: '' }, ticketTypes: [{ price: 150, quantity: 200, quantitySold: 130 }] },
      ]);
      setPagination({ page: 1, pages: 1, total: 6 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [category, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="events-page">
      <div className="container">
        <div className="events-header">
          <div>
            <h1 className="text-headline-lg">Explore Events</h1>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>{pagination.total} events available</p>
          </div>
          <div className="view-toggle">
            <button className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><FiGrid size={18} /></button>
            <button className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><FiList size={18} /></button>
          </div>
        </div>

        {/* Filters */}
        <div className="events-filters">
          <form className="filter-search" onSubmit={handleSearch}>
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field" />
          </form>
          <div className="filter-categories">
            {categories.map((cat) => (
              <button key={cat} className={`filter-chip ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
                {cat === 'all' ? '🌟 All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <select className="filter-sort input-field" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date_asc">Date: Soonest</option>
            <option value="date_desc">Date: Latest</option>
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {/* Events Grid */}
        <div className={`events-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
          {loading
            ? Array(6).fill(0).map((_, i) => <div key={i} className="skeleton event-skeleton"></div>)
            : events.length > 0
              ? events.map((event) => <EventCard key={event._id} event={event} />)
              : <div className="no-events"><p className="text-headline-md">No events found</p><p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>Try adjusting your search or filters</p></div>
          }
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button key={i} className={`pagination-btn ${pagination.page === i + 1 ? 'active' : ''}`} onClick={() => fetchEvents(i + 1)}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
