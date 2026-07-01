import api from './api.js';

/**
 * Log a new mood entry.
 */
export const createMood = async (moodData) => {
  const response = await api.post('/moods', moodData);
  return response.data;
};

/**
 * Fetch paginated mood logs for the authenticated user.
 */
export const getMoods = async (page = 1, limit = 10) => {
  const response = await api.get('/moods', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Fetch a single mood entry by ID.
 */
export const getMood = async (id) => {
  const response = await api.get(`/moods/${id}`);
  return response.data;
};

/**
 * Update a specific mood entry by ID.
 */
export const updateMood = async (id, moodData) => {
  const response = await api.put(`/moods/${id}`, moodData);
  return response.data;
};

/**
 * Delete a specific mood entry by ID.
 */
export const deleteMood = async (id) => {
  const response = await api.delete(`/moods/${id}`);
  return response.data;
};

/**
 * Fetch user analytics stats for the dashboard.
 */
export const getMoodStats = async () => {
  const response = await api.get('/moods/stats');
  return response.data;
};

/**
 * Fetch daily/weekly trends and mood distribution charts.
 */
export const getMoodTrends = async () => {
  const response = await api.get('/moods/trends');
  return response.data;
};
