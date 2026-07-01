import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} from '../utils/tokenHelpers.js';

/**
 * Registers a new user account.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, avatarUrl, bio } = req.body;

  // Check if the user email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'An account with this email address already exists.');
  }

  // Instantiate user (password gets hashed in pre-save hook)
  const user = new User({
    name,
    email,
    passwordHash: password, // Raw password mapped to schema passwordHash field
    avatarUrl,
    bio,
  });

  await user.save();

  // Generate session JWTs
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Attach tokens to secure HTTP-only cookies
  setTokenCookies(res, accessToken, refreshToken);

  const responseData = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    }
  };

  return res.status(201).json(
    new ApiResponse(201, responseData, 'Account successfully created.')
  );
});

/**
 * Logs in a user.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Fetch user including email check
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Verify password matching
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Check if the account is administratively suspended
  if (user.isSuspended) {
    throw new ApiError(403, 'Your account has been suspended. Please contact support.');
  }

  // Generate session JWTs
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set secure cookies
  setTokenCookies(res, accessToken, refreshToken);

  const responseData = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    }
  };

  return res.status(200).json(
    new ApiResponse(200, responseData, 'Logged in successfully.')
  );
});

/**
 * Logs out a user and clears cookies.
 */
export const logout = asyncHandler(async (req, res) => {
  clearTokenCookies(res);
  return res.status(200).json(
    new ApiResponse(200, null, 'Logged out successfully.')
  );
});

/**
 * Verifies refresh token and issues new rotated tokens.
 */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  
  if (!token) {
    throw new ApiError(401, 'Refresh token is missing.');
  }

  try {
    // Verify token validity
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Find matching active user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, 'User session no longer valid.');
    }

    if (user.isSuspended) {
      throw new ApiError(403, 'Your account has been suspended.');
    }

    // Generate new access and refresh tokens (token rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Set secure cookies
    setTokenCookies(res, newAccessToken, newRefreshToken);

    return res.status(200).json(
      new ApiResponse(200, null, 'Session token refreshed.')
    );

  } catch (error) {
    // Catch token validation errors (e.g. Expired, invalid signature)
    throw new ApiError(401, 'Invalid or expired session. Please login again.');
  }
});

/**
 * Retrieves the current authenticated user's details.
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select('-passwordHash');
  
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }

  if (user.isSuspended) {
    throw new ApiError(403, 'Your account is suspended.');
  }

  return res.status(200).json(
    new ApiResponse(200, { user }, 'Profile details retrieved successfully.')
  );
});
