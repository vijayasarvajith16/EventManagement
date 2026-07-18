import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRegistrations, getAllEvents, unregisterFromEvent } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Admin Dashboard ──────────────────────────────────────────
const AdminDashboard = ({ user, formatDate }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEvents()
      .then((res) => setEvents(res.data.events))
      .catch(() => toast.error('Failed to load events.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date());
  const pastEvents    = events.filter((e) => new Date(e.date) <  new Date());
  const totalRegs     = events.reduce((sum, e) => sum + (e.registrationCount || 0), 0);

  return (
    <div className="page dashboard-page">
      {/* Profile */}
      <div className="dashboard-header">
        <div className="profile-card">
          <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <div className="profile-tags">
              <span className={`tag role-tag ${user.role}`}>{user.role}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{events.length}</div>
            <div className="stat-label">Total Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{upcomingEvents.length}</div>
            <div className="stat-label">Upcoming Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalRegs}</div>
            <div className="stat-label">Total Registrations</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <Link to="/create-event" className="btn-primary">+ Create Event</Link>
        <Link to="/events" className="btn-ghost">View All Events</Link>
      </div>

      {/* Upcoming events table */}
      <section className="reg-section">
        <h2 className="section-title">📅 Upcoming Events — Registration Overview</h2>

        {upcomingEvents.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="empty-icon">📭</div>
            <p>No upcoming events. Create one to get started.</p>
          </div>
        ) : (
          <div className="admin-events-table-wrapper">
            <table className="participants-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Category</th>
                  <th>Registrations</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map((event, i) => {
                  const pct = event.maxSeats
                    ? Math.min((event.registrationCount / event.maxSeats) * 100, 100)
                    : null;
                  const isFull = event.maxSeats && event.registrationCount >= event.maxSeats;

                  return (
                    <tr key={event._id}>
                      <td>{i + 1}</td>
                      <td className="participant-name">{event.title}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(event.date)}</td>
                      <td>{event.venue}</td>
                      <td>
                        <span className="event-category-badge" style={{ fontSize: '0.72rem' }}>
                          {event.category || 'General'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: isFull ? 'var(--red)' : 'var(--green)',
                          fontSize: '1rem',
                        }}>
                          {event.registrationCount}
                        </span>
                      </td>
                      <td style={{ minWidth: '120px' }}>
                        {event.maxSeats ? (
                          <div>
                            <div className="seats-bar" style={{ marginBottom: '4px' }}>
                              <div
                                className="seats-bar-fill"
                                style={{ width: `${pct}%`, background: isFull ? 'var(--red)' : undefined }}
                              />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--subtext0)' }}>
                              {event.registrationCount} / {event.maxSeats}
                              {isFull && <span style={{ color: 'var(--red)', marginLeft: '4px' }}>Full</span>}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--subtext0)', fontSize: '0.8rem' }}>Unlimited</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-btns">
                          <Link to={`/events/${event._id}`} className="btn-secondary btn-sm">View</Link>
                          <Link to={`/events/${event._id}/edit`} className="btn-edit btn-sm">Edit</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Past events summary */}
      {pastEvents.length > 0 && (
        <section className="reg-section">
          <h2 className="section-title">🕐 Past Events</h2>
          <div className="reg-list">
            {pastEvents.map((event) => (
              <div key={event._id} className="reg-card past">
                <div className="reg-card-info">
                  <h3>{event.title}</h3>
                  <div className="reg-meta">
                    <span>📅 {formatDate(event.date)}</span>
                    <span>📍 {event.venue}</span>
                    <span>👥 {event.registrationCount} registered</span>
                  </div>
                </div>
                <Link to={`/events/${event._id}`} className="btn-ghost btn-sm">View</Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// ── Student Dashboard ────────────────────────────────────────
const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      const res = await getMyRegistrations();
      setRegistrations(res.data.registrations);
    } catch {
      toast.error('Failed to load your registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegistrations(); }, []);

  const handleCancel = async (eventId, eventTitle) => {
    if (!window.confirm(`Cancel registration for "${eventTitle}"?`)) return;
    try {
      await unregisterFromEvent(eventId);
      toast.success('Registration cancelled.');
      setRegistrations((prev) => prev.filter((r) => r.event._id !== eventId));
    } catch {
      toast.error('Failed to cancel registration.');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const upcoming = registrations.filter((r) => new Date(r.event.date) >= new Date());
  const past     = registrations.filter((r) => new Date(r.event.date) <  new Date());

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  // ── Route admin to their own view
  if (isAdmin) return <AdminDashboard user={user} formatDate={formatDate} />;

  // ── Student view
  return (
    <div className="page dashboard-page">
      <div className="dashboard-header">
        <div className="profile-card">
          <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <div className="profile-tags">
              <span className="tag">{user.rollNumber}</span>
              <span className="tag">{user.department}</span>
              <span className="tag">{user.college}</span>
              <span className="tag">Year {user.year}</span>
              <span className={`tag role-tag ${user.role}`}>{user.role}</span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{registrations.length}</div>
            <div className="stat-label">Total Registrations</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{upcoming.length}</div>
            <div className="stat-label">Upcoming Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{past.length}</div>
            <div className="stat-label">Past Events</div>
          </div>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>You haven't registered for any events yet.</p>
          <Link to="/events" className="btn-primary">Browse Events</Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="reg-section">
              <h2 className="section-title">📅 Upcoming Events</h2>
              <div className="reg-list">
                {upcoming.map((r) => (
                  <div key={r.registrationId} className="reg-card">
                    <div className="reg-card-info">
                      <h3>{r.event.title}</h3>
                      <div className="reg-meta">
                        <span>📅 {formatDate(r.event.date)}</span>
                        <span>📍 {r.event.venue}</span>
                        <span>🏷 {r.event.category || 'General'}</span>
                      </div>
                      <p className="reg-date">Registered on {formatDate(r.registeredAt)}</p>
                    </div>
                    <div className="reg-card-actions">
                      <Link to={`/events/${r.event._id}`} className="btn-secondary btn-sm">View</Link>
                      <button
                        className="btn-delete btn-sm"
                        onClick={() => handleCancel(r.event._id, r.event.title)}
                      >Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className="reg-section">
              <h2 className="section-title">🕐 Past Events</h2>
              <div className="reg-list">
                {past.map((r) => (
                  <div key={r.registrationId} className="reg-card past">
                    <div className="reg-card-info">
                      <h3>{r.event.title}</h3>
                      <div className="reg-meta">
                        <span>📅 {formatDate(r.event.date)}</span>
                        <span>📍 {r.event.venue}</span>
                      </div>
                    </div>
                    <Link to={`/events/${r.event._id}`} className="btn-ghost btn-sm">View</Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
