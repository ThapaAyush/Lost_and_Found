import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  actor = null,
  action,
  targetType,
  targetId = null,
  metadata = {},
  req = null,
}) => {
  try {
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '';
    const userAgent = req?.headers?.['user-agent'] || '';

    await AuditLog.create({
      actor: actor?._id || actor || null,
      action,
      targetType,
      targetId,
      metadata,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('[AuditLog Error]', error.message);
  }
};
