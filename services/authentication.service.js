const JWT = require("jsonwebtoken");

const secret = process.env.JWT_SECRET || "$saksham@123#"; // Fallback if env variable is missing

/**
 * Creates a JWT token for the given user.
 * @param {Object} user - User object.
 * @returns {string} JWT token.
 */
function createTokenForUser(user) {
  const payload = {
    id: user._id, // MongoDB `_id` field
    email: user.email,
    profileImage: user.profileImage,
    fullname: user.fullname,
    role: user.role,
    bio: user.bio,
  };

  const token = JWT.sign(payload, secret, { expiresIn: "10h" });
  return token;
}

/**
 * Verifies a JWT token and returns the payload.
 * @param {string} token - JWT token.
 * @returns {Object} Decoded payload.
 * @throws Will throw an error if the token is invalid or expired.
 */
function verifyUserToken(token) {
  try {
    const payload = JWT.verify(token, secret);
    return payload; // Returns decoded token (user data)
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired. Please login again.");
    }
    throw new Error("Invalid token. Please login again.");
  }
}

module.exports = {
  createTokenForUser,
  verifyUserToken,
};
