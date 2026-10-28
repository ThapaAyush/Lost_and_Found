import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check HTTP-only cookie first, then Authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lost_and_found_super_secret_jwt_key_2026_dev_prod');

    // Fetch user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this session no longer exists.',
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token. Please log in again.',
    });
  }
};

/**
 * Optional protection: attaches req.user if a valid token is provided,
 * but allows unauthenticated requests to proceed.
 */
export const optionalProtect = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'lost_and_found_super_secret_jwt_key_2026_dev_prod'
    );
    const user = await User.findById(decoded.id);
    if (user && user.accountStatus !== 'suspended') {
      req.user = user;
    } else {
      req.user = null;
    }
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};
