import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getEventById, registerForEvent, unregisterFromEvent,
  getParticipants, deleteEvent
} from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const fetchEvent = async () => {
    try {
      const res = await getEventById(id);
      setEvent(res.data.event);
    } catch {
      toast.error('Event not found.');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvent(); }, [id]);

  const fetchParticipants = async () => {
    try {
      const res = await getParticipants(id);
      setParticipants(res.data.participants);
      setShowParticipants(true);
    } catch {
      toast.error('Failed to load participants.');
    }
  };

  const handleRegister = async () => {
    setRegLoading(true);
    try {
      await registerForEvent(id);
      toast.success('Successfully registered! 🎉');
      fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!window.confirm('Cancel your registration for this event?')) return;
    setRegLoading(true);
    try {
      await unregisterFromEvent(id);
      toast.success('Registration cancelled.');
      fetchEvent();
    } catch {
      toast.error('Failed to cancel registration.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event permanently?')) return;
    try {
      await deleteEvent(id);
      toast.success('Event deleted.');
      navigate('/events');
    } catch {
      toast.error('Failed to delete event.');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const isFull = event?.maxSeats && event.registrationCount >= event.maxSeats;
  const isPast = event && new Date(event.date) < new Date();

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!event) return null;

  return (
    <div className="page event-detail-page">
      <div className="event-detail-card">
        <div className="event-detail-header">
          <Link to="/events" className="back-link">← Back to Events</Link>
          <div className="event-detail-badges">
            <span className="event-category-badge">{event.category || 'General'}</span>
            {isPast && <span className="event-badge-past">Past Event</span>}
            {isFull && !isPast && <span className="event-badge-full">Fully Booked</span>}
          </div>
        </div>

        <h1 className="event-detail-title">{event.title}</h1>

        <div className="event-detail-meta-grid">
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <div>
              <p className="meta-label">Date</p>
              <p className="meta-value">{formatDate(event.date)}</p>
            </div>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📍</span>
            <div>
              <p className="meta-label">Venue</p>
              <p className="meta-value">{event.venue}</p>
            </div>
          </div>
          <div className="meta-item">
            <span className="meta-icon">👥</span>
            <div>
              <p className="meta-label">Registrations</p>
              <p className="meta-value">
                {event.registrationCount}
                {event.maxSeats ? ` / ${event.maxSeats} seats` : ' registered'}
              </p>
            </div>
          </div>
          <div className="meta-item">
            <span className="meta-icon">👤</span>
            <div>
              <p className="meta-label">Organised by</p>
              <p className="meta-value">{event.createdBy?.name || 'Admin'}</p>
            </div>
          </div>
        </div>

        {event.maxSeats && (
          <div className="seats-bar-container">
            <div className="seats-bar">
              <div
                className="seats-bar-fill"
                style={{ width: `${Math.min((event.registrationCount / event.maxSeats) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="seats-label">{event.maxSeats - event.registrationCount} seats remaining</p>
          </div>
        )}

        <div className="event-detail-description">
          <h2>About this Event</h2>
          <p>{event.description}</p>
        </div>

        <div className="event-detail-actions">
          {!isPast && user?.role === 'student' && (
            event.isRegistered ? (
              <button className="btn-danger" onClick={handleUnregister} disabled={regLoading}>
                {regLoading ? <span className="btn-spinner"></span> : '✕ Cancel Registration'}
              </button>
            ) : (
              <button className="btn-primary" onClick={handleRegister} disabled={regLoading || isFull}>
                {regLoading ? <span className="btn-spinner"></span> : isFull ? 'Event Full' : '✓ Register Now'}
              </button>
            )
          )}

          {isAdmin && (
            <div className="admin-btns">
              <Link to={`/events/${id}/edit`} className="btn-secondary">Edit Event</Link>
              <button className="btn-danger" onClick={handleDelete}>Delete Event</button>
            </div>
          )}

          <button
            className="btn-ghost"
            onClick={showParticipants ? () => setShowParticipants(false) : fetchParticipants}
          >
            {showParticipants ? 'Hide' : 'View'} Participants ({event.registrationCount})
          </button>
        </div>

        {showParticipants && (
          <div className="participants-section">
            <h2>Registered Participants</h2>
            {participants.length === 0 ? (
              <p className="no-participants">No participants yet.</p>
            ) : (
              <div className="participants-table-wrapper">
                <table className="participants-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Roll No.</th>
                      <th>Department</th>
                      <th>College</th>
                      <th>Year</th>
                      <th>Email</th>
                      <th>Registered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p, i) => (
                      <tr key={p._id || i}>
                        <td>{i + 1}</td>
                        <td className="participant-name">{p.name}</td>
                        <td>{p.rollNumber}</td>
                        <td>{p.department}</td>
                        <td>{p.college}</td>
                        <td>Year {p.year}</td>
                        <td>{p.email}</td>
                        <td>{new Date(p.registeredAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
