import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createEvent, getEventById, updateEvent } from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['General', 'Workshop', 'Hackathon', 'Seminar', 'Cultural', 'Sports'];

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '', description: '', date: '', venue: '', maxSeats: '', category: 'General',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (isEdit) {
      getEventById(id)
        .then((res) => {
          const e = res.data.event;
          setForm({
            title: e.title,
            description: e.description,
            date: e.date.slice(0, 10),
            venue: e.venue,
            maxSeats: e.maxSeats || '',
            category: e.category || 'General',
          });
        })
        .catch(() => { toast.error('Event not found.'); navigate('/events'); })
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    const payload = {
      ...form,
      maxSeats: form.maxSeats ? Number(form.maxSeats) : null,
    };

    try {
      if (isEdit) {
        await updateEvent(id, payload);
        toast.success('Event updated!');
        navigate(`/events/${id}`);
      } else {
        const res = await createEvent(payload);
        toast.success('Event created! 🎉');
        navigate(`/events/${res.data.event._id}`);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else toast.error(data?.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page form-page">
      <div className="form-card">
        <div className="form-card-header">
          <h1>{isEdit ? '✏️ Edit Event' : '➕ Create New Event'}</h1>
          <Link to="/events" className="back-link">← Back</Link>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input id="title" name="title" type="text" placeholder="e.g. Tech Talk 2024"
              value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea id="description" name="description" rows="4"
              placeholder="Describe the event in detail..."
              value={form.description} onChange={handleChange} required></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Event Date *</label>
              <input id="date" name="date" type="date"
                value={form.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="venue">Venue *</label>
              <input id="venue" name="venue" type="text" placeholder="e.g. CSE Seminar Hall"
                value={form.venue} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="maxSeats">Max Seats <span className="optional">(optional)</span></label>
              <input id="maxSeats" name="maxSeats" type="number" min="1"
                placeholder="Leave blank for unlimited"
                value={form.maxSeats} onChange={handleChange} />
            </div>
          </div>

          {errors.length > 0 && (
            <div className="error-list">
              {errors.map((e, i) => <p key={i} className="error-item">⚠ {e.message}</p>)}
            </div>
          )}

          <div className="form-submit-row">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner"></span> : isEdit ? 'Update Event' : 'Create Event'}
            </button>
            <Link to="/events" className="btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
