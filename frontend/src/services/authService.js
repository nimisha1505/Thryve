import api from './api.js';

/**
 * Sends a registration request to the backend.
 */
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Sends a login request to the backend.
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Sends a logout request to the backend.
 */
export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

/**
 * Fetches the authenticated user profile.
 */
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
