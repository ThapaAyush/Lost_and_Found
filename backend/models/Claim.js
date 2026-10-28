import mongoose from 'mongoose';

export const CLAIM_STATUSES = ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'];

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    explanation: {
      type: String,
      required: [true, 'Please explain why this item belongs to you'],
      trim: true,
      minlength: [10, 'Explanation must be at least 10 characters'],
      maxlength: [2000, 'Explanation cannot exceed 2000 characters'],
    },
    privateEvidence: {
      type: [String],
      default: [], // URLs to uploaded receipts, invoice photos, or private marks
    },
    secretIdentifiers: {
      type: String,
      trim: true,
      default: '', // Serial numbers, internal engravings, passcode info only visible to claimant & reviewer
    },
    status: {
      type: String,
      enum: CLAIM_STATUSES,
      default: 'pending',
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple pending/under_review claims on the same item by the same claimant
claimSchema.index(
  { item: 1, claimant: 1, status: 1 }
);

const Claim = mongoose.model('Claim', claimSchema);
export default Claim;
