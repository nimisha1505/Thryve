import api from './api.js';

/**
 * Send a chat message to the AI companion.
 * @param {string} message 
 */
export const sendMessage = async (message) => {
  const response = await api.post('/chat', { message });
  return response.data;
};

/**
 * Retrieve the conversation logs history.
 */
export const getChatHistory = async () => {
  const response = await api.get('/chat/history');
  return response.data;
};

/**
 * Clear the chat history logs database.
 */
export const clearChatHistory = async () => {
  const response = await api.delete('/chat/history');
  return response.data;
};
