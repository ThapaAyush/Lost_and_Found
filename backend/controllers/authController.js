import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logAudit } from '../services/auditService.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';

// Helper to sign JWT and set HTTP-only cookie
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'lost_and_found_super_secret_jwt_key_2026_dev_prod',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const cookieExpireDays = 7;
  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    message,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

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

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.trim() : '',
      role: 'user', // Always user on signup
    });

    await logAudit({
      actor: user._id,
      action: 'USER_REGISTERED',
      targetType: 'User',
      targetId: user._id,
      metadata: { email: user.email },
      req,
    });

    // Send welcome email in background
    sendWelcomeEmail(user).catch((err) =>
      console.error('[Welcome Email Failed]', err.message)
    );

    sendTokenResponse(user, 201, res, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    await logAudit({
      actor: user._id,
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: user._id,
      metadata: { email: user.email },
      req,
    });

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Log out user and clear cookie
// @route   POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logAudit({
        actor: req.user._id,
        action: 'USER_LOGOUT',
        targetType: 'User',
        targetId: req.user._id,
        req,
      });
    }

    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
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

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your account email address',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return safe message to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been sent.',
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token for database storage
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save({ validateBeforeSave: false });

    // Send email
    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: 'Email could not be dispatched. Please try again later.',
      });
    }

    await logAudit({
      actor: user._id,
      action: 'PASSWORD_RESET_REQUESTED',
      targetType: 'User',
      targetId: user._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent.',
      // In dev mode, return token so tester/user can test directly if email is not configured
      devResetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await logAudit({
      actor: user._id,
      action: 'PASSWORD_RESET_COMPLETED',
      targetType: 'User',
      targetId: user._id,
      req,
    });

    sendTokenResponse(user, 200, res, 'Password reset successful. You are now logged in.');
  } catch (error) {
    next(error);
  }
};
