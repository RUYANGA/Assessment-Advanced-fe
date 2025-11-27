import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL =process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage on client init (if present)
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Request interceptor example (optional extra logging)
api.interceptors.request.use(
  (config) => {
    // debug: log outgoing requests and whether Authorization header is present
    try {
      const method = config.method?.toUpperCase() ?? "UNKNOWN"
      const url = config.url ?? ""
      const hasAuth = !!config.headers?.Authorization || !!api.defaults.headers.common['Authorization']
      // avoid logging the full token
      console.debug("api request", { method, url, hasAuth })
    } catch (e) {
      // ignore logging errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors (e.g., 401)
api.interceptors.response.use(
  (res) => {
    try {
      console.debug("api response", { status: res.status, url: res.config?.url })
    } catch (e) {}
    return res
  },
  (error) => {
    try {
        const status = error?.response?.status
        const url = error?.config?.url
        // avoid noisy warnings for expected 404s from the optional stats endpoint
        if (typeof url === 'string' && url.includes('/purchases/requests/stats')) {
          console.debug('api error (stats endpoint)', { status, url })
        } else {
          console.warn("api error", { status, url })
        }
    } catch (e) {}
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      // simple handling: remove token on 401 and notify user
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      try {
        toast.error('Session expired or unauthorized — please sign in')
      } catch (e) {}
      // redirect to login page after short delay so toast is visible
      try {
        setTimeout(() => {
          window.location.href = '/login'
        }, 400)
      } catch (e) {}
    }
    return Promise.reject(error);
  }
);

/**
 * Set or clear the Authorization header and persist token (client-side).
 * Call setAuthToken(token) after login and setAuthToken(null) on logout.
 */
export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;