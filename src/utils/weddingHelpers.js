const Wedding = require('../models/Wedding');

/**
 * Get wedding for the current user
 * @param {string} userId - The user ID from req.user.id
 * @param {string} weddingId - Optional wedding ID from query/body
 * @returns {Promise<Wedding>} The wedding document
 * @throws {Error} If no wedding found
 */
const getUserWedding = async (userId, weddingId = null) => {
  let wedding;
  
  if (weddingId) {
    // Get specific wedding and verify ownership
    wedding = await Wedding.findOne({ _id: weddingId, couple: userId });
  } else {
    // Get most recent wedding
    wedding = await Wedding.findOne({ couple: userId }).sort({ createdAt: -1 });
  }
  
  return wedding;
};

module.exports = {
  getUserWedding
};
