import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import AbuseReport from '../models/AbuseReport.js';
import AuditLog from '../models/AuditLog.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

// @desc    Get system-wide administrative statistics
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalLostReports,
      totalFoundReports,
      openReports,
      returnedItems,
      pendingClaims,
      openAbuseReports,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: { $in: ['lost', 'found'] } }),
      Item.countDocuments({ status: 'returned' }),
      Claim.countDocuments({ status: { $in: ['pending', 'under_review'] } }),
      AbuseReport.countDocuments({ reviewStatus: 'pending' }),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).populate('actor', 'name email'),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalLostReports,
        totalFoundReports,
        openReports,
        returnedItems,
        pendingClaims,
        openAbuseReports,
      },
      recentAuditLogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get paginated users list
// @route   GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (role && role !== 'All') query.role = role;
    if (status && status !== 'All') query.accountStatus = status;

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageLimit;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageLimit),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / pageLimit),
      currentPage: pageNum,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (suspend/activate) or role
// @route   PATCH /api/admin/users/:id/status
export const updateUserStatus = async (req, res, next) => {
  try {
    const { accountStatus, role } = req.body;
    const targetUserId = req.params.id;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot alter their own role or suspension status.',
      });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.email?.toLowerCase() === 'ayush108ayush108@gmail.com') {
      return res.status(400).json({
        success: false,
        message: 'The designated permanent administrator account cannot be demoted or suspended.',
      });
    }

    if (accountStatus && ['active', 'suspended'].includes(accountStatus)) {
      user.accountStatus = accountStatus;
    }

    if (role && ['user', 'admin'].includes(role)) {
      user.role = role;
    }

    await user.save();

    await logAudit({
      actor: req.user._id,
      action: 'ADMIN_USER_UPDATED',
      targetType: 'User',
      targetId: user._id,
      metadata: { accountStatus: user.accountStatus, role: user.role },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and related records
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot delete their own account.',
      });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.email?.toLowerCase() === 'ayush108ayush108@gmail.com') {
      return res.status(400).json({
        success: false,
        message: 'The designated permanent administrator account cannot be deleted.',
      });
    }

    await User.findByIdAndDelete(targetUserId);
    await Item.deleteMany({ owner: targetUserId });
    await Claim.deleteMany({ claimant: targetUserId });

    await logAudit({
      actor: req.user._id,
      action: 'ADMIN_USER_DELETED',
      targetType: 'User',
      targetId: user._id,
      metadata: { name: user.name, email: user.email },
      req,
    });

    res.status(200).json({
      success: true,
      message: `User "${user.name}" and associated records were removed successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register / Sign up a new user from the admin part
// @route   POST /api/admin/users
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.trim() : '',
      role: role === 'admin' ? 'admin' : 'user',
      accountStatus: 'active',
      emailVerified: true,
    });

    await newUser.save();

    await logAudit({
      actor: req.user._id,
      action: 'ADMIN_USER_CREATED',
      targetType: 'User',
      targetId: newUser._id,
      metadata: { name: newUser.name, email: newUser.email, role: newUser.role },
      req,
    });

    res.status(201).json({
      success: true,
      message: `User account for "${newUser.name}" was registered successfully`,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        accountStatus: newUser.accountStatus,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items for moderation
// @route   GET /api/admin/items
export const getAdminItems = async (req, res, next) => {
  try {
    const { search, type, category, isProhibited, page = 1, limit = 15 } = req.query;
    const query = {};

    if (type && type !== 'All') query.type = type;
    if (category && category !== 'All') query.category = category;
    if (isProhibited !== undefined && isProhibited !== 'All') {
      query.isProhibited = isProhibited === 'true';
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { locationDescription: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageLimit;

    const [items, total] = await Promise.all([
      Item.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .populate('owner', 'name email'),
      Item.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / pageLimit),
      currentPage: pageNum,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate item (toggle isProhibited)
// @route   PATCH /api/admin/items/:id/moderate
export const moderateItem = async (req, res, next) => {
  try {
    const { isProhibited, reason } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    item.isProhibited = Boolean(isProhibited);
    await item.save();

    await logAudit({
      actor: req.user._id,
      action: isProhibited ? 'ADMIN_ITEM_PROHIBITED' : 'ADMIN_ITEM_UNPROHIBITED',
      targetType: 'Item',
      targetId: item._id,
      metadata: { reason },
      req,
    });

    // Notify item owner
    await createNotification({
      recipient: item.owner,
      type: 'admin_action',
      title: isProhibited ? `Listing Removed by Moderation` : `Listing Restored`,
      message: isProhibited
        ? `Your listing "${item.title}" was hidden due to platform moderation policy. Reason: ${
            reason || 'Policy guidelines'
          }`
        : `Your listing "${item.title}" has been restored.`,
      relatedItem: item._id,
    });

    res.status(200).json({
      success: true,
      message: isProhibited ? 'Item listing marked as prohibited' : 'Item listing restored',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get claims for moderation / dispute resolution
// @route   GET /api/admin/claims
export const getAdminClaims = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'All') query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageLimit;

    const [claims, total] = await Promise.all([
      Claim.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .populate('item')
        .populate('claimant', 'name email phone avatar')
        .populate('reviewer', 'name email'),
      Claim.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: claims.length,
      total,
      totalPages: Math.ceil(total / pageLimit),
      currentPage: pageNum,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get abuse reports
// @route   GET /api/admin/abuse-reports
export const getAbuseReports = async (req, res, next) => {
  try {
    const { reviewStatus, page = 1, limit = 15 } = req.query;
    const query = {};

    if (reviewStatus && reviewStatus !== 'All') query.reviewStatus = reviewStatus;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageLimit;

    const [reports, total] = await Promise.all([
      AbuseReport.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .populate('reporter', 'name email')
        .populate('reviewer', 'name email'),
      AbuseReport.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      totalPages: Math.ceil(total / pageLimit),
      currentPage: pageNum,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve abuse report
// @route   PATCH /api/admin/abuse-reports/:id
export const resolveAbuseReport = async (req, res, next) => {
  try {
    const { reviewStatus, resolutionDetails } = req.body;

    if (!reviewStatus || !['reviewed', 'resolved', 'dismissed'].includes(reviewStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid resolution status' });
    }

    const report = await AbuseReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Abuse report not found' });
    }

    report.reviewStatus = reviewStatus;
    report.resolutionDetails = resolutionDetails ? resolutionDetails.trim() : '';
    report.reviewer = req.user._id;
    report.resolvedAt = new Date();
    await report.save();

    await logAudit({
      actor: req.user._id,
      action: `ABUSE_REPORT_${reviewStatus.toUpperCase()}`,
      targetType: 'AbuseReport',
      targetId: report._id,
      metadata: { reviewStatus, resolutionDetails },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Abuse report resolution updated',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, targetType, page = 1, limit = 20 } = req.query;
    const query = {};

    if (action) query.action = { $regex: action, $options: 'i' };
    if (targetType) query.targetType = targetType;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageLimit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .populate('actor', 'name email role'),
      AuditLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / pageLimit),
      currentPage: pageNum,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
