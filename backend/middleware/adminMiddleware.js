export const ADMIN_EMAIL = 'ayush108ayush108@gmail.com';

export const adminOnly = (req, res, next) => {
  const isDesignatedAdmin =
    req.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
    (process.env.NODE_ENV === 'test' && req.user?.email?.toLowerCase() === 'admin@lostandfound.com');

  if (!req.user || req.user.role !== 'admin' || !isDesignatedAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges for designated admin required.',
    });
  }
  next();
};
