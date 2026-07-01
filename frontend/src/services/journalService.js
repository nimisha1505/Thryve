import api from './api.js';

/**
 * Create a new journal entry.
 */
export const createJournal = async (journalData) => {
  const response = await api.post('/journals', journalData);
  return response.data;
};

/**
 * Fetch user's journal entries with search, pagination, and filter parameters.
 */
export const getJournals = async (params = {}) => {
  const response = await api.get('/journals', { params });
  return response.data;
};

/**
 * Fetch a single journal entry by ID.
 */
export const getJournal = async (id) => {
  const response = await api.get(`/journals/${id}`);
  return response.data;
};

/**
 * Update an existing journal entry.
 */
export const updateJournal = async (id, journalData) => {
  const response = await api.put(`/journals/${id}`, journalData);
  return response.data;
};

/**
 * Delete a specific journal entry.
 */
export const deleteJournal = async (id) => {
  const response = await api.delete(`/journals/${id}`);
  return response.data;
};

/**
 * Toggle the pinned status of a specific journal.
 */
export const togglePin = async (id) => {
  const response = await api.patch(`/journals/${id}/pin`);
  return response.data;
};

/**
 * Fetch journal summary metrics for the dashboard.
 */
export const getJournalStats = async () => {
  const response = await api.get('/journals/stats');
  return response.data;
};

/**
 * Fetch weekly, monthly, category, and mood distributions.
 */
export const getJournalAnalytics = async () => {
  const response = await api.get('/journals/analytics');
  return response.data;
};
