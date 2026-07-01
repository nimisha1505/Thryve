import api from './api.js';

/**
 * Fetch all resources (filterable by search, category, type)
 */
export const getResources = async (params = {}) => {
  const response = await api.get('/resources', { params });
  return response.data;
};

/**
 * Fetch featured resources for carousel/grid
 */
export const getFeaturedResources = async () => {
  const response = await api.get('/resources/featured');
  return response.data;
};

/**
 * Fetch detailed resource content and related resources by ID
 */
export const getResource = async (id) => {
  const response = await api.get(`/resources/${id}`);
  return response.data;
};

/**
 * Fetch list of resources under specific category
 */
export const getResourcesByCategory = async (category) => {
  const response = await api.get(`/resources/category/${encodeURIComponent(category)}`);
  return response.data;
};
