import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

/* ── Hackathons ─────────────────────────────────────────── */
/**
 * fd must be a FormData with:
 *   bannerImage       File  (optional)
 *   organizerLogo     File  (optional)
 *   trackPdf_0        File  (optional PDF for track 0)
 *   trackPdf_1        File  (optional PDF for track 1)
 *   …
 *   + all text fields as strings / JSON strings
 */
export const createHackathon    = fd  => api.post('/hackathons', fd,
  { headers: { 'Content-Type': 'multipart/form-data' } });

export const getAllHackathons    = ()  => api.get('/hackathons');
export const getHackathonBySlug = s   => api.get(`/hackathons/${s}`);
export const updateHackathon    = (s, fd) => api.put(`/hackathons/${s}`, fd,
  { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteHackathon    = s   => api.delete(`/hackathons/${s}`);

/* ── Registrations ──────────────────────────────────────── */
export const registerTeam       = d   => api.post('/registrations', d);
export const getRegistrations   = id  => api.get(`/registrations/${id}`);

export default api;
