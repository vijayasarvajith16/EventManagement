import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:2007/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('csea_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerStudent = (data) => API.post('/auth/register', data);
export const loginStudent = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Events
export const createEvent = (data) => API.post('/events', data);
export const getAllEvents = () => API.get('/events');
export const getEventById = (id) => API.get(`/events/${id}`);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);

// Registrations
export const registerForEvent = (id) => API.post(`/events/${id}/register`);
export const unregisterFromEvent = (id) => API.delete(`/events/${id}/register`);
export const getParticipants = (id) => API.get(`/events/${id}/participants`);
export const getMyRegistrations = () => API.get('/registrations/my');

export default API;
