import api from './api.js';

/**
 * Fetch the overall Wellbeing Score, streak, trends, and next-day forecast metrics.
 */
export const getInsightsSummary = async () => {
  const response = await api.get('/insights/summary');
  return response.data;
};

/**
 * Fetch tag, category weekday and hourly distribution analytics, and correlation coefficients.
 */
export const getInsightsPatterns = async () => {
  const response = await api.get('/insights/patterns');
  return response.data;
};

/**
 * Fetch personalized wellness suggestions, prompt reflection cards, and habit advice.
 */
export const getInsightsRecommendations = async () => {
  const response = await api.get('/insights/recommendations');
  return response.data;
};
