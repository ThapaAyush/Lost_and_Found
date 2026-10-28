import { findMatchesForUser, findCommunityMatches } from '../services/matchingService.js';

// @desc    Get all potential matches for current user's active reports
// @route   GET /api/matches
export const getMatches = async (req, res, next) => {
  try {
    const minScore = req.query.minScore ? parseInt(req.query.minScore, 10) : 35;
    const matches = await findMatchesForUser(req.user._id, minScore);

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active community matches (lost items that match found items)
// @route   GET /api/matches/community
export const getCommunityMatches = async (req, res, next) => {
  try {
    const minScore = req.query.minScore ? parseInt(req.query.minScore, 10) : 35;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    const matches = await findCommunityMatches(minScore, limit);

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};
