import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import Notification from '../models/Notification.js';
import { findMatchesForUser } from '../services/matchingService.js';
import { logAudit } from '../services/auditService.js';
import { processUploadedFile } from '../middleware/uploadMiddleware.js';

// @desc    Get current user profile
// @route   GET /api/users/me
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PATCH /api/users/me
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Editable fields
    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.phone !== undefined) user.phone = req.body.phone.trim();

    // Check if user requested avatar removal or upload
    if (req.body.removeAvatar === 'true' || req.body.removeAvatar === true || req.body.avatar === '') {
      user.avatar = '';
    } else if (req.file) {
      const avatarUrl = await processUploadedFile(req.file, req);
      if (avatarUrl) {
        user.avatar = avatarUrl;
      }
    } else if (req.body.avatar !== undefined) {
      user.avatar = req.body.avatar;
    }

    // Note: Never allow updating role, accountStatus, or emailVerification here
    await user.save();

    await logAudit({
      actor: user._id,
      action: 'USER_PROFILE_UPDATED',
      targetType: 'User',
      targetId: user._id,
      metadata: { name: user.name, phone: user.phone, avatar: user.avatar },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove user profile picture / avatar
// @route   DELETE /api/users/me/avatar
export const deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.avatar = '';
    await user.save();

    await logAudit({
      actor: user._id,
      action: 'USER_AVATAR_REMOVED',
      targetType: 'User',
      targetId: user._id,
      metadata: {},
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   POST /api/users/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    await logAudit({
      actor: user._id,
      action: 'USER_PASSWORD_CHANGED',
      targetType: 'User',
      targetId: user._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for current user
// @route   GET /api/users/stats
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Concurrently fetch counts
    const [
      totalLost,
      totalFound,
      openReports,
      returnedItems,
      pendingClaims,
      unreadNotifications,
      recentItems,
      recentNotifications,
      potentialMatches,
    ] = await Promise.all([
      Item.countDocuments({ owner: userId, type: 'lost' }),
      Item.countDocuments({ owner: userId, type: 'found' }),
      Item.countDocuments({ owner: userId, status: { $in: ['lost', 'found'] } }),
      Item.countDocuments({ owner: userId, status: 'returned' }),
      Claim.countDocuments({ claimant: userId, status: { $in: ['pending', 'under_review'] } }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
      Item.find({ owner: userId }).sort({ createdAt: -1 }).limit(5),
      Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(5),
      findMatchesForUser(userId, 30),
    ]);

    // Calculate total potential candidate matches
    const totalPotentialMatches = potentialMatches.reduce(
      (acc, matchGroup) => acc + matchGroup.candidateMatches.length,
      0
    );

    res.status(200).json({
      success: true,
      stats: {
        totalLost,
        totalFound,
        openReports,
        returnedItems,
        pendingClaims,
        unreadNotifications,
        potentialMatchesCount: totalPotentialMatches,
      },
      recentItems,
      recentNotifications,
      potentialMatchesSummary: potentialMatches.slice(0, 3),
    });
  } catch (error) {
    next(error);
  }
};
