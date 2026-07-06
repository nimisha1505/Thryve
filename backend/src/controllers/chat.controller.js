import Chat from '../models/chat.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Crisis Detection Patterns
const CRISIS_KEYWORDS = [
  /\bself[- ]harm\b/i,
  /\bsuicide\b/i,
  /\bsuicidal\b/i,
  /\bkill myself\b/i,
  /\bend my life\b/i,
  /\bharm myself\b/i,
  /\bhurt myself\b/i,
  /\bkill others\b/i,
  /\bharm others\b/i,
  /\bhurt others\b/i,
  /\bwant to die\b/i,
  /\bcutting myself\b/i,
];

const checkCrisis = (text) => {
  return CRISIS_KEYWORDS.some((regex) => regex.test(text));
};

const CRISIS_RESPONSE = `I'm so sorry you're going through this, but please know that you are not alone and there is support available. Because I'm an AI companion and not a professional crisis counselor, I want to strongly encourage you to connect with human professionals who can help you right now:

*   **In the US:** Call or text **988** to reach the Suicide & Crisis Lifeline, available 24 hours a day, 7 days a week. Services are free and confidential. You can also chat online at **988lifeline.org**.
*   **In India:** Reach out to local emergency services or contact supportive helplines like **Vandrevala Foundation (9999 666 555)** or **AASRA (91-9820466726)**.
*   **In Canada:** Call or text **988** to reach the Suicide Crisis Helpline.
*   **In the UK:** Call **111** to reach the NHS mental health services, or call the Samaritans at **116 123**.
*   **International:** Find local support resources in your country at **findahelpline.com** or **befrienders.org**.

Please reach out to a trusted friend, family member, guardian, or healthcare professional. Your life is valuable, and there are people who want to listen and support you.`;

const SYSTEM_INSTRUCTION = `You are THRYVE AI Companion, a supportive, warm, and empathetic mental wellness assistant.
Your role:
- Listen to the user with deep empathy and concern.
- Help them reflect on their thoughts, emotions, and experiences in a non-judgmental way.
- Suggest healthy coping mechanisms, mindfulness exercises, deep breathing, gratitude practices, and healthy daily routines.
- Maintain a calm, supportive, and reassuring tone.
- Keep your responses relatively concise, warm, and actionable.

Important Boundaries:
- You are NOT a licensed therapist, counselor, psychiatrist, or doctor.
- You must never diagnose any mental health illnesses or provide medical/pharmacological advice.
- If the user discusses complex psychiatric issues, gently remind them that you are an AI companion, and suggest they speak with a licensed professional.
- Do not encourage or recommend any self-harm, violent, or dangerous actions. If you detect emergency crisis signals, prioritize guiding them to local emergency resources or hotlines immediately.`;

// Helper to generate title using Gemini
const generateTitleFromMessage = async (genAI, userMessage) => {
  try {
    const prompt = `Based on this user request, generate a short, empathetic mental wellness conversation title (3 to 8 words). Return only the title text, with no quote marks, markdown, or extra explanations.\n\nUser request: "${userMessage}"`;
    const titleModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await titleModel.generateContent(prompt);
    let title = result.response.text().trim();
    title = title.replace(/^["'“”‘`]|["'“”’`]$/g, '').trim();
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    return title || 'Wellness Chat';
  } catch (err) {
    console.error('Error generating title:', err);
    return 'Wellness Chat';
  }
};

/**
 * Sends a message to the Gemini AI Companion.
 * Retrieves history context (up to 20 messages), computes titles if needed,
 * screens for crisis, and saves chat documents in MongoDB.
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user.userId;

  if (!message || message.trim() === '') {
    throw new ApiError(400, 'Message is required.');
  }

  if (message.length > 2000) {
    throw new ApiError(400, 'Message cannot exceed 2000 characters.');
  }

  // 1. Establish Gemini configuration and check for mock mode
  const apiKey = process.env.GEMINI_API_KEY;
  const isMockMode = !apiKey || apiKey === 'mock' || apiKey === '';
  let genAI = null;

  if (!isMockMode) {
    genAI = new GoogleGenerativeAI(apiKey);
  }

  // 2. Fetch conversation history details & determine/generate Title
  const existingCount = await Chat.countDocuments({ userId });
  let conversationTitle = '';

  if (existingCount === 0) {
    if (isMockMode) {
      // Offline fallback title generation
      const words = message.trim().split(/\s+/).slice(0, 4).join(' ');
      conversationTitle = words ? `${words} Support` : 'Wellness Chat';
    } else {
      conversationTitle = await generateTitleFromMessage(genAI, message.trim());
    }
  } else {
    // Reuse existing title of last message
    const lastChat = await Chat.findOne({ userId }).sort({ createdAt: -1 });
    conversationTitle = lastChat?.conversationTitle || 'Wellness Chat';
  }

  // 3. Perform Crisis Screening Check
  if (checkCrisis(message)) {
    const userLog = new Chat({
      userId,
      role: 'user',
      message: message.trim(),
      conversationTitle,
    });
    await userLog.save();

    const assistantLog = new Chat({
      userId,
      role: 'assistant',
      message: CRISIS_RESPONSE,
      conversationTitle,
    });
    await assistantLog.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          userMessage: userLog,
          assistantResponse: assistantLog,
        },
        'Empathetic response generated successfully.'
      )
    );
  }

  let replyText = '';

  if (isMockMode) {
    // 4. Generate mock reply if offline
    replyText = `Thank you for sharing that with me. I am currently running in offline demo mode (please configure \`GEMINI_API_KEY\` in your backend \`.env\` file to activate live AI answers). 

Here are some helpful wellness reminders for your thought **"${message.trim().substring(0, 60)}${message.length > 60 ? '...' : ''}"**:
*   **Breathe slowly**: Take a few seconds to ground yourself right now.
*   **Journal it**: Expanding your reflections in your **[Journal](file:///companion)** or tracking your **[Mood Tracker](file:///mood)** is a great way to decode internal stress.
*   **Be gentle**: Give yourself permission to feel what you're feeling without judgment.

Let me know if there's anything else you'd like to talk about.`;
  } else {
    // 5. Retrieve last 20 messages for context window
    const previousLogs = await Chat.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    previousLogs.reverse();

    const history = previousLogs.map((log) => ({
      role: log.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: log.message }],
    }));

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessage(message.trim());
      replyText = result.response.text();
    } catch (apiErr) {
      console.error('Gemini API Error details:', apiErr);
      throw new ApiError(502, 'Failed to obtain response from AI Companion. Please try again.');
    }
  }

  // 6. Save logs to database
  const userLog = new Chat({
    userId,
    role: 'user',
    message: message.trim(),
    conversationTitle,
  });
  await userLog.save();

  const assistantLog = new Chat({
    userId,
    role: 'assistant',
    message: replyText.trim(),
    conversationTitle,
  });
  await assistantLog.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        userMessage: userLog,
        assistantResponse: assistantLog,
      },
      'AI response generated successfully.'
    )
  );
});

/**
 * Retrieves the full chronological chat logs history for the user.
 */
export const getChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const logs = await Chat.find({ userId }).sort({ createdAt: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        history: logs,
        conversationTitle: logs[0]?.conversationTitle || '',
      },
      'Chat history retrieved successfully.'
    )
  );
});

/**
 * Clears the chat logs history for the user.
 */
export const clearChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  await Chat.deleteMany({ userId });

  return res.status(200).json(
    new ApiResponse(200, null, 'Chat history cleared successfully.')
  );
});
