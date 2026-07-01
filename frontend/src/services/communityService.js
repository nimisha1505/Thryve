import api from './api.js';

/**
 * Share a new anonymous post
 */
export const createPost = async (postData) => {
  const response = await api.post('/community', postData);
  return response.data;
};

/**
 * Fetch all posts with filters (moodTag, search, sort, page, limit)
 */
export const getFeed = async (params = {}) => {
  const response = await api.get('/community', { params });
  return response.data;
};

/**
 * Fetch a single post detail with its comments
 */
export const getPost = async (id) => {
  const response = await api.get(`/community/${id}`);
  return response.data;
};

/**
 * Add a comment to an anonymous post
 */
export const createComment = async (postId, content) => {
  const response = await api.post(`/community/${postId}/comment`, { content });
  return response.data;
};

/**
 * Add a support reaction to a post (support, hug, stayStrong)
 */
export const reactPost = async (postId, reactionType) => {
  const response = await api.post(`/community/${postId}/reaction`, { reactionType });
  return response.data;
};

/**
 * Remove a support reaction from a post (support, hug, stayStrong)
 */
export const unreactPost = async (postId, reactionType) => {
  const response = await api.delete(`/community/${postId}/reaction`, { data: { reactionType } });
  return response.data;
};

/**
 * Fetch trending posts for Dashboard preview
 */
export const getTrendingPosts = async () => {
  const response = await api.get('/community/trending');
  return response.data;
};
