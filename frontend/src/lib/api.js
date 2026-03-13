// Centralised API client
// Usage: import api from '@/lib/api'
// api.post('/auth/signup', { ... })

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(method, path, body) {
  const token = localStorage.getItem("hf_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();

  if (!res.ok) {
    // Attach server message to error so callers can use it
    const error = new Error(data.message || "Request failed");
    error.status = res.status;
    throw error;
  }

  return data;
}

const api = {
  get:    (path)        => request("GET",    path),
  post:   (path, body)  => request("POST",   path, body),
  put:    (path, body)  => request("PUT",    path, body),
  delete: (path)        => request("DELETE", path),
};

export default api;
