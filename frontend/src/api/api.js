const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Guest id for cart use before login - same one persisted across the app.
function getGuestId() {
  let id = localStorage.getItem("guestId");
  if (!id) {
    id = "guest_" + Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem("guestId", id);
  }
  return id;
}

/**
 * One reusable, same-syntax request function used by every API call in
 * this app: request(method, path, body?, isMultipart?).
 * Handles auth header, guest-cart header, and JSON parsing in one place.
 */
async function request(method, path, body, isMultipart = false) {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isMultipart) headers["Content-Type"] = "application/json";
  headers["x-guest-id"] = getGuestId();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isMultipart ? body : JSON.stringify(body)) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

// Thin, reusable wrappers - every resource below follows the same shape.
export const api = {
  get: (path) => request("GET", path),
  post: (path, body, isMultipart) => request("POST", path, body, isMultipart),
  put: (path, body, isMultipart) => request("PUT", path, body, isMultipart),
  del: (path) => request("DELETE", path),
  getGuestId,
};
