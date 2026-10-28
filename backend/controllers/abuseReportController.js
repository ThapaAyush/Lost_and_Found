import AbuseReport, { REPORT_REASONS } from '../models/AbuseReport.js';
import { logAudit } from '../services/auditService.js';

// @desc    Submit an abuse or policy violation report
// @route   POST /api/reports
export const submitReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Target type, target ID, reason, and explanation are required',
      });
    }

    if (!REPORT_REASONS.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `Reason must be one of: ${REPORT_REASONS.join(', ')}`,
      });
    }

    const report = await AbuseReport.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      description: description.trim(),
    });

    await logAudit({
      actor: req.user._id,
      action: 'ABUSE_REPORT_SUBMITTED',
      targetType: 'AbuseReport',
      targetId: report._id,
      metadata: { targetType, targetId, reason },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Your report has been submitted to moderation team for review.',
      report,
    });
  } catch (error) {
    next(error);
  }
};
