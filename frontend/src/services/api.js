import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Send credentials (cookies) along with requests
});

// Interceptor to handle silent access token refresh/rotation on 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Avoid infinite loop if the refresh endpoint itself returns a 401
      if (originalRequest.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      try {
        // Request new access cookie from backend using refresh token
        await api.post('/auth/refresh');
        
        // Retry original request since the cookie was updated
        return api(originalRequest);
      } catch (refreshError) {
        console.warn('Session expired. Clearing context...');
        // Broadcast custom event so AuthContext knows to wipe the user state
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
