import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiTag } from 'react-icons/fi';
import { format } from 'date-fns';
import './EventCard.css';

const EventCard = ({ event }) => {
  const lowestPrice = event.ticketTypes?.reduce((min, t) => Math.min(min, t.price), Infinity) || 0;
  const totalAvailable = event.ticketTypes?.reduce((sum, t) => sum + (t.quantity - t.quantitySold), 0) || 0;

  const categoryColors = {
    music: '#6c5ce7', tech: '#00b894', sports: '#fdcb6e',
    arts: '#e17055', food: '#d63031', business: '#0984e3', other: '#928ea0',
  };

  return (
    <Link to={`/events/${event._id}`} className="event-card card-hover">
      <div className="event-card-image">
        <img src={event.image?.url || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop`} alt={event.title} />
        <span className="event-category-badge" style={{ background: `${categoryColors[event.category] || categoryColors.other}33`, color: categoryColors[event.category] }}>
          {event.category}
        </span>
        {totalAvailable <= 10 && totalAvailable > 0 && (
          <span className="event-urgency">Only {totalAvailable} left!</span>
        )}
      </div>
      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>
        <div className="event-card-meta">
          <span className="meta-item">
            <FiCalendar size={14} />
            {event.date ? format(new Date(event.date), 'MMM dd, yyyy') : 'TBA'}
          </span>
          <span className="meta-item">
            <FiMapPin size={14} />
            {event.location?.city || 'Online'}
          </span>
        </div>
        <div className="event-card-footer">
          <span className="event-price">
            <FiTag size={14} />
            {lowestPrice === 0 ? 'Free' : `From $${lowestPrice}`}
          </span>
          <span className="btn btn-primary btn-sm">Book Now</span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
