import Resource from '../models/resource.model.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Seed Default Wellness Resources if collection is empty
 */
export const seedDefaultResources = async () => {
  try {
    // Clear existing resources to ensure fresh seeding with local paths
    await Resource.deleteMany({});
    console.log('[Resources Seeder] Cleared old resources from database.');

    const defaultResources = [
      {
        title: 'Gentle Rain',
        description: 'Relax with soft rainfall sounds for focus and stress relief.',
        category: 'Nature Sounds',
        type: 'audio',
        audioUrl: '/audio/rain.mp3',
        thumbnail: 'rain',
        isFeatured: true,
      },
      {
        title: 'Ocean Waves',
        description: 'Slow rhythmic waves designed to promote relaxation.',
        category: 'Nature Sounds',
        type: 'audio',
        audioUrl: '/audio/ocean.mp3',
        thumbnail: 'ocean',
        isFeatured: true,
      },
      {
        title: 'Forest Calm',
        description: 'Listen to peaceful forest ambience and birdsong.',
        category: 'Nature Sounds',
        type: 'audio',
        audioUrl: '/audio/forest.mp3',
        thumbnail: 'forest',
        isFeatured: false,
      },
      {
        title: 'Cozy Fireplace',
        description: 'Warm fireplace ambience for comfort and calm.',
        category: 'Nature Sounds',
        type: 'audio',
        audioUrl: '/audio/fireplace.mp3',
        thumbnail: 'fireplace',
        isFeatured: true,
      },
      {
        title: 'Night Crickets',
        description: 'A quiet nighttime atmosphere for reflection and sleep.',
        category: 'Nature Sounds',
        type: 'audio',
        audioUrl: '/audio/crickets.mp3',
        thumbnail: 'crickets',
        isFeatured: false,
      },
      {
        title: 'Box Breathing Exercise',
        description: 'A structured breathing pattern used by professionals to control anxiety.',
        category: 'Breathing Exercises',
        type: 'exercise',
        content: '1. Inhale slowly through your nose for 4 seconds.\n2. Hold your lungs full for 4 seconds.\n3. Exhale completely through your mouth for 4 seconds.\n4. Hold your lungs empty for 4 seconds.\n\nRepeat this cycle 4-6 times to calm your nervous system.',
        thumbnail: 'breathing',
        isFeatured: true,
      },
      {
        title: '4-7-8 Breathing Guide',
        description: 'A natural tranquilizer to ground yourself and promote restful sleep.',
        category: 'Breathing Exercises',
        type: 'exercise',
        content: '1. Exhale completely through your mouth, making a whoosh sound.\n2. Close your mouth and inhale quietly through your nose for 4 seconds.\n3. Hold your breath for a count of 7 seconds.\n4. Exhale completely through your mouth for a count of 8 seconds.\n\nRepeat the cycle for 4 full breath cycles.',
        thumbnail: 'breathing',
        isFeatured: false,
      },
      {
        title: 'Confidence Affirmation',
        description: 'Align your mind with strength and capability.',
        category: 'Daily Affirmations',
        type: 'quote',
        content: 'I am prepared, capable, and strong enough to navigate any challenge that crosses my path today.',
        thumbnail: 'affirmations',
        isFeatured: false,
      },
      {
        title: 'Self-Love Affirmation',
        description: 'Empower yourself with compassion and self-acceptance.',
        category: 'Daily Affirmations',
        type: 'quote',
        content: 'I accept myself unconditionally, acknowledge my worth, and speak to myself with kindness.',
        thumbnail: 'affirmations',
        isFeatured: true,
      },
      {
        title: 'Daily Motivation Prompt',
        description: 'A concise quote to inspire step-by-step progress.',
        category: 'Motivation',
        type: 'quote',
        content: 'Do not wait for conditions to be perfect to begin. Beginning makes the conditions perfect.',
        thumbnail: 'motivation',
        isFeatured: false,
      },
      {
        title: 'Growth Mindset Guide',
        description: 'Fostering resilience, learning from failures, and expanding abilities.',
        category: 'Motivation',
        type: 'article',
        content: 'A growth mindset—coined by psychologist Carol Dweck—is the belief that basic abilities can be developed through dedication and hard work. Viewing setbacks as learning opportunities rather than static limitations changes your emotional approach to obstacles.\n\nPractices to encourage growth:\n- Value the effort and process, not just final scores.\n- Treat setbacks as diagnostic information rather than personal failures.\n- Challenge yourself intentionally with unfamiliar skills.',
        thumbnail: 'motivation',
        isFeatured: false,
      },
      {
        title: 'Better Sleep Hygiene',
        description: 'Essential bedtime practices to enhance sleep quality.',
        category: 'Sleep Improvement',
        type: 'article',
        content: 'Good sleep hygiene means having a bedroom environment and daily routine that promote consistent, uninterrupted sleep.\n\nRules of Sleep Hygiene:\n1. Maintain a regular wake-up and bedtime schedule.\n2. Disconnect from screens (phones, tablets, TVs) at least 30 minutes before bed.\n3. Keep your room dark, quiet, and cool (around 65°F / 18°C).\n4. Minimize heavy food and caffeine intakes in the late afternoons.',
        thumbnail: 'sleep',
        isFeatured: false,
      },
    ];

    await Resource.insertMany(defaultResources);
    console.log('[Resources Seeder] Default wellness resources seeded successfully.');
  } catch (error) {
    console.error('[Resources Seeder] Error seeding default resources:', error);
  }
};

/**
 * Fetch all resources (filterable by category, type, search)
 */
export const getResources = asyncHandler(async (req, res) => {
  const { category, type, search } = req.query;
  const filter = {};

  if (category) {
    filter.category = category;
  }
  if (type) {
    filter.type = type;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const resources = await Resource.find(filter).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { resources }, 'Resources retrieved successfully.')
  );
});

/**
 * Fetch featured resources
 */
export const getFeaturedResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ isFeatured: true }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { resources }, 'Featured resources retrieved successfully.')
  );
});

/**
 * Fetch resource by ID
 */
export const getResourceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Resource ID.');
  }

  const resource = await Resource.findById(id);
  if (!resource) {
    throw new ApiError(404, 'Resource not found.');
  }

  // Fetch related resources (in the same category, excluding current resource)
  const related = await Resource.find({
    category: resource.category,
    _id: { $ne: resource._id },
  }).limit(3);

  return res.status(200).json(
    new ApiResponse(200, { resource, related }, 'Resource details retrieved successfully.')
  );
});

/**
 * Fetch resources by Category
 */
export const getResourcesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  const resources = await Resource.find({ category }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { resources }, `Resources for category '${category}' retrieved successfully.`)
  );
});
