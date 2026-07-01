import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(401, 'Access token is missing. Please log in.');
  }

  try {
    // Verify token authenticity and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded properties (userId and role) to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired access token. Please log in again.');
  }
});

/**
 * Role-Based Access Control (RBAC) middleware guard.
 * Restricts routes to specified roles (e.g., 'admin').
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }
    next();
  };
};
