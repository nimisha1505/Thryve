import jwt from 'jsonwebtoken';

/**
 * Generates a short-lived access token containing userId and role.
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME || '15m' }
  );
};

/**
 * Generates a long-lived refresh token containing userId.
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_LIFETIME || '7d' }
  );
};

/**
 * Attaches the access and refresh tokens to secure, HTTP-only cookies.
 */
export const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true, // Prevents client-side scripts from reading the cookie
    secure: isProduction, // Requires HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // Protects against CSRF; None enables cross-site for external hosting
  };

  // Set access token cookie (expires in 15 minutes)
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  // Set refresh token cookie (expires in 7 days)
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

/**
 * Clears authentication cookies from the response object.
 */
export const clearTokenCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};
