import mongoose from 'mongoose';

export const ITEM_CATEGORIES = [
  'Electronics',
  'Wallets and purses',
  'Bags and backpacks',
  'Keys',
  'Documents and identity cards',
  'Jewelry',
  'Clothing',
  'Books',
  'Accessories',
  'Other',
];

export const ITEM_STATUSES = ['lost', 'found', 'handed_over', 'returned', 'closed'];

export const CUSTODY_OPTIONS = [
  'still_with_finder',
  'reception_or_security',
  'lost_property_office',
  'returned_to_owner',
  'not_applicable',
];

const itemHistorySchema = new mongoose.Schema(
  {
    fromStatus: { type: String, enum: ITEM_STATUSES },
    toStatus: { type: String, enum: ITEM_STATUSES, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    handoverLocation: { type: String, default: '' },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    category: {
      type: String,
      enum: ITEM_CATEGORIES,
      required: [true, 'Please select a valid category'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    distinguishingFeatures: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    locationDescription: {
      type: String,
      required: [true, 'Please provide the location description'],
      trim: true,
    },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    incidentDate: {
      type: Date,
      required: [true, 'Please specify the incident date'],
      index: true,
    },
    incidentTime: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ITEM_STATUSES,
      required: true,
      index: true,
    },
    custodyDetails: {
      type: String,
      enum: CUSTODY_OPTIONS,
      default: 'not_applicable',
    },
    custodyNotes: {
      type: String,
      trim: true,
      default: '',
    },
    circumstances: {
      type: String,
      trim: true,
      default: '',
    },
    travelRoute: {
      type: String,
      trim: true,
      default: '',
    },
    additionalNotes: {
      type: String,
      trim: true,
      default: '',
    },
    isProhibited: {
      type: Boolean,
      default: false,
      index: true,
    },
    history: [itemHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Composite Text Index for intelligent search and ranking
itemSchema.index({
  title: 'text',
  description: 'text',
  brand: 'text',
  color: 'text',
  distinguishingFeatures: 'text',
  locationDescription: 'text',
});

// Common compound index for listing and filter queries
itemSchema.index({ type: 1, status: 1, createdAt: -1 });
itemSchema.index({ category: 1, status: 1 });

const Item = mongoose.model('Item', itemSchema);
export default Item;
