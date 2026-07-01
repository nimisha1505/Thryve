import { ApiError } from '../utils/ApiError.js';

const forbiddenKeywords = [
  // Self-harm / crisis terms
  'suicide', 'kill myself', 'self-harm', 'cutting', 'end my life', 'harm myself', 'hang myself', 'slit wrist',
  // Hate speech & harassment terms
  'hate speech', 'nigger', 'faggot', 'retard', 'kike', 'abuse', 'harass'
];

const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\d{10}\b/;

export const moderateContent = (req, res, next) => {
  const { title, content } = req.body;
  
  // Moderate title (if present) and content
  const textsToCheck = [title || '', content || ''];

  for (const text of textsToCheck) {
    if (!text) continue;

    const lowerText = text.toLowerCase();

    // 1. Hate speech / Harassment / Self-harm check
    for (const keyword of forbiddenKeywords) {
      if (lowerText.includes(keyword)) {
        throw new ApiError(400, 'Content contains inappropriate language or sensitive topics. Please help keep this community safe and supportive.');
      }
    }

    // 2. Email detection
    if (emailRegex.test(text)) {
      throw new ApiError(400, 'Sharing email addresses is not permitted to protect user privacy.');
    }

    // 3. Phone number detection
    if (phoneRegex.test(text)) {
      throw new ApiError(400, 'Sharing phone numbers is not permitted to protect user privacy.');
    }
  }

  next();
};
