import api from './api.js';

/**
 * Create a new habit.
 */
export const createHabit = async (habitData) => {
  const response = await api.post('/habits', habitData);
  return response.data;
};

/**
 * Fetch all unarchived habits for the authenticated user.
 */
export const getHabits = async () => {
  const response = await api.get('/habits');
  return response.data;
};

/**
 * Fetch a single habit by ID.
 */
export const getHabit = async (id) => {
  const response = await api.get(`/habits/${id}`);
  return response.data;
};

/**
 * Update habit details.
 */
export const updateHabit = async (id, habitData) => {
  const response = await api.put(`/habits/${id}`, habitData);
  return response.data;
};

/**
 * Delete a specific habit.
 */
export const deleteHabit = async (id) => {
  const response = await api.delete(`/habits/${id}`);
  return response.data;
};

/**
 * Toggle completion of a habit for a date.
 */
export const toggleHabit = async (id, dateStr) => {
  const response = await api.post(`/habits/${id}/toggle`, { date: dateStr });
  return response.data;
};

/**
 * Fetch habit completion analytics.
 */
export const getHabitAnalytics = async () => {
  const response = await api.get('/habits/analytics');
  return response.data;
};

/**
 * Fetch mood correlation statistics.
 */
export const getHabitMoodCorrelation = async () => {
  const response = await api.get('/habits/correlation');
  return response.data;
};

/**
 * Fetch smart AI habit suggestions based on user logs.
 */
export const getSmartHabitSuggestions = async () => {
  const response = await api.get('/habits/suggestions');
  return response.data;
};
