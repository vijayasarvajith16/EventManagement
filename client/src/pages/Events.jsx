import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllEvents, deleteEvent } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  General: '#6366f1',
  Workshop: '#f59e0b',
  Hackathon: '#10b981',
  Seminar: '#3b82f6',
  Cultural: '#ec4899',
  Sports: '#ef4444',
};

const Events = () => {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await getAllEvents();
      setEvents(res.data.events);
    } catch {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? All registrations will also be removed.`)) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      toast.success('Event deleted.');
    } catch {
      toast.error('Failed to delete event.');
    }
  };

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase()) ||
    (e.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const isFull = (e) => e.maxSeats && e.registrationCount >= e.maxSeats;
  const isPast = (e) => new Date(e.date) < new Date();

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page events-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">{events.length} events available</p>
        </div>
        <div className="page-actions">
          <input
            className="search-input"
            type="text"
            placeholder="🔍 Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isAdmin && (
            <Link to="/create-event" className="btn-primary">+ Create Event</Link>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>No events found.</p>
        </div>
      ) : (
        <div className="events-grid">
          {filtered.map((event) => (
            <div key={event._id} className={`event-card ${isPast(event) ? 'past' : ''}`}>
              <div className="event-card-top">
                <span
                  className="event-category"
                  style={{ backgroundColor: CATEGORY_COLORS[event.category] || '#6366f1' }}
                >
                  {event.category || 'General'}
                </span>
                {isPast(event) && <span className="event-badge-past">Past</span>}
                {isFull(event) && !isPast(event) && <span className="event-badge-full">Full</span>}
              </div>

              <h3 className="event-title">{event.title}</h3>
              <p className="event-description">{event.description.substring(0, 100)}...</p>

              <div className="event-meta">
                <span>📅 {formatDate(event.date)}</span>
                <span>📍 {event.venue}</span>
                <span>👥 {event.registrationCount}{event.maxSeats ? `/${event.maxSeats}` : ''} registered</span>
              </div>

              <div className="event-footer">
                <Link to={`/events/${event._id}`} className="btn-secondary btn-sm">View Details</Link>
                {isAdmin && (
                  <div className="admin-btns">
                    <Link to={`/events/${event._id}/edit`} className="btn-edit btn-sm">Edit</Link>
                    <button onClick={() => handleDelete(event._id, event.title)} className="btn-delete btn-sm">Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
