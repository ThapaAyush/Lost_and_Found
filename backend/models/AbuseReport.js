import mongoose from 'mongoose';

export const REPORT_REASONS = [
  'scam_fraud',
  'inappropriate_content',
  'harassment',
  'prohibited_item',
  'false_claim',
  'other',
];

const abuseReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['item', 'claim', 'user', 'conversation'],
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: REPORT_REASONS,
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please explain the reason for this report'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionDetails: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

abuseReportSchema.index({ reviewStatus: 1, createdAt: -1 });

const AbuseReport = mongoose.model('AbuseReport', abuseReportSchema);
export default AbuseReport;
