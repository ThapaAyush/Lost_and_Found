import Item, { ITEM_CATEGORIES, ITEM_STATUSES, CUSTODY_OPTIONS } from '../models/Item.js';
import Claim from '../models/Claim.js';
import { processUploadedFiles } from '../middleware/uploadMiddleware.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';
import { findMatchesForItem } from '../services/matchingService.js';

// @desc    Get all items with search, filter, and pagination
// @route   GET /api/items
export const getItems = async (req, res, next) => {
  try {
    const {
      search,
      type,
      category,
      status,
      location,
      startDate,
      endDate,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isProhibited: false };

    // Filter by type (lost / found)
    if (type && ['lost', 'found'].includes(type)) {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by location substring
    if (location) {
      query.locationDescription = { $regex: location, $options: 'i' };
    }

    // Date range filter
    if (startDate || endDate) {
      query.incidentDate = {};
      if (startDate) query.incidentDate.$gte = new Date(startDate);
      if (endDate) query.incidentDate.$lte = new Date(endDate);
    }

    // Keyword search using regex or text index
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
        { color: { $regex: search.trim(), $options: 'i' } },
        { distinguishingFeatures: { $regex: search.trim(), $options: 'i' } },
        { locationDescription: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageLimit;

    // Sort order
    const sortObj = {};
    sortObj[sortBy] = order === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      Item.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(pageLimit)
        .populate('owner', 'name avatar createdAt'),
      Item.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / pageLimit),
      currentPage: pageNumber,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item details
// @route   GET /api/items/:id
export const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name avatar createdAt')
      .populate('history.changedBy', 'name');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    if (item.isProhibited && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This listing has been taken down due to platform moderation policies.',
      });
    }

    const isOwner = req.user && item.owner._id.toString() === req.user._id.toString();

    // Check if current user already has an active claim on this item
    let existingClaim = null;
    let approvedConversationId = null;
    if (req.user && !isOwner) {
      existingClaim = await Claim.findOne({
        item: item._id,
        claimant: req.user._id,
        status: { $in: ['pending', 'under_review', 'approved'] },
      });

      if (existingClaim && existingClaim.status === 'approved') {
        const Conversation = (await import('../models/Conversation.js')).default;
        const conv = await Conversation.findOne({
          relatedItem: item._id,
          participants: { $all: [req.user._id, item.owner._id] },
        });
        approvedConversationId = conv?._id || null;
      }
    }

    res.status(200).json({
      success: true,
      item,
      isOwner,
      hasActiveClaim: Boolean(existingClaim),
      activeClaimId: existingClaim?._id || null,
      claimStatus: existingClaim?.status || null,
      approvedConversationId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new report (Lost or Found)
// @route   POST /api/items
export const createItem = async (req, res, next) => {
  try {
    const {
      type,
      title,
      category,
      description,
      brand,
      color,
      distinguishingFeatures,
      locationDescription,
      incidentDate,
      incidentTime,
      custodyDetails,
      custodyNotes,
      circumstances,
      travelRoute,
      additionalNotes,
    } = req.body;

    // Validation
    if (!type || !['lost', 'found'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Report type must be "lost" or "found"' });
    }

    if (!title || !category || !description || !locationDescription || !incidentDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, description, location, and incident date are required',
      });
    }

    if (!ITEM_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category selected' });
    }

    // Process uploaded images if any
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await processUploadedFiles(req.files, req);
    } else if (req.body.images) {
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const defaultStatus = type; // 'lost' or 'found'

    const item = await Item.create({
      owner: req.user._id,
      type,
      title: title.trim(),
      category,
      description: description.trim(),
      brand: brand ? brand.trim() : '',
      color: color ? color.trim() : '',
      distinguishingFeatures: distinguishingFeatures ? distinguishingFeatures.trim() : '',
      images: imageUrls,
      locationDescription: locationDescription.trim(),
      incidentDate: new Date(incidentDate),
      incidentTime: incidentTime || '',
      status: defaultStatus,
      custodyDetails: type === 'found' ? custodyDetails || 'still_with_finder' : 'not_applicable',
      custodyNotes: custodyNotes ? custodyNotes.trim() : '',
      circumstances: circumstances ? circumstances.trim() : '',
      travelRoute: travelRoute ? travelRoute.trim() : '',
      additionalNotes: additionalNotes ? additionalNotes.trim() : '',
      history: [
        {
          fromStatus: null,
          toStatus: defaultStatus,
          changedBy: req.user._id,
          note: `Initial ${type} report filed`,
        },
      ],
    });

    await logAudit({
      actor: req.user._id,
      action: `ITEM_CREATED_${type.toUpperCase()}`,
      targetType: 'Item',
      targetId: item._id,
      metadata: { title: item.title, category: item.category },
      req,
    });

    // Notify user of successful creation
    await createNotification({
      recipient: req.user._id,
      type: 'report_created',
      title: `${type === 'lost' ? 'Lost' : 'Found'} Item Report Published`,
      message: `Your report for "${item.title}" is now active and visible to the community.`,
      relatedItem: item._id,
    });

    // Check for potential matches asynchronously and notify if high confidence match found!
    findMatchesForItem(item._id, 40)
      .then(async (matches) => {
        if (matches.length > 0) {
          const topMatch = matches[0];
          // Notify creator of new item
          await createNotification({
            recipient: req.user._id,
            type: 'potential_match',
            title: `Potential Match Discovered for "${item.title}"!`,
            message: `A candidate match "${topMatch.item.title}" with a ${topMatch.score}% match score was found.`,
            relatedItem: item._id,
          });

          // Also notify owner of the matched opposite report
          await createNotification({
            recipient: topMatch.item.owner._id,
            type: 'potential_match',
            title: `New Candidate Match for your "${topMatch.item.title}"!`,
            message: `A newly filed report "${item.title}" matches your report (${topMatch.score}% match).`,
            relatedItem: topMatch.item._id,
          });
        }
      })
      .catch((err) => console.error('[Match Discovery Error]', err.message));

    res.status(201).json({
      success: true,
      message: 'Report published successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an item report
// @route   PATCH /api/items/:id
export const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    const isOwner = item.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this report',
      });
    }

    // Editable fields
    const editableFields = [
      'title',
      'category',
      'description',
      'brand',
      'color',
      'distinguishingFeatures',
      'locationDescription',
      'incidentDate',
      'incidentTime',
      'custodyDetails',
      'custodyNotes',
      'circumstances',
      'travelRoute',
      'additionalNotes',
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newUrls = await processUploadedFiles(req.files, req);
      item.images = [...(item.images || []), ...newUrls];
    } else if (req.body.images && Array.isArray(req.body.images)) {
      item.images = req.body.images;
    }

    await item.save();

    await logAudit({
      actor: req.user._id,
      action: 'ITEM_UPDATED',
      targetType: 'Item',
      targetId: item._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Item report updated successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item status lifecycle (lost, found, handed_over, returned, closed)
// @route   PATCH /api/items/:id/status
export const updateItemStatus = async (req, res, next) => {
  try {
    const { status, note, custodyDetails, handoverLocation } = req.body;

    if (!status || !ITEM_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Valid status must be one of: ${ITEM_STATUSES.join(', ')}`,
      });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    const isOwner = item.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Allow owner, admin, or a verified claimant (for returning) to update status
    const approvedClaim = await Claim.findOne({
      item: item._id,
      claimant: req.user._id,
      status: 'approved',
    });

    const canUpdate = isOwner || isAdmin || (approvedClaim && status === 'returned');

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the report owner, administrator, or verified claimant can update this status.',
      });
    }

    const prevStatus = item.status;
    item.status = status;
    if (custodyDetails && CUSTODY_OPTIONS.includes(custodyDetails)) {
      item.custodyDetails = custodyDetails;
    }

    // Append to lifecycle history
    item.history.push({
      fromStatus: prevStatus,
      toStatus: status,
      changedBy: req.user._id,
      note: note || `Item marked as ${status}. Handover completed.`,
      handoverLocation: handoverLocation || '',
    });

    await item.save();

    await logAudit({
      actor: req.user._id,
      action: 'ITEM_STATUS_CHANGED',
      targetType: 'Item',
      targetId: item._id,
      metadata: { fromStatus: prevStatus, toStatus: status, handoverLocation },
      req,
    });

    // If marked returned, also check if claimant had a matching lost item report and mark it returned
    if (status === 'returned') {
      const activeClaims = await Claim.find({ item: item._id, status: 'approved' });
      for (const cl of activeClaims) {
        const matchingLostReports = await Item.find({
          owner: cl.claimant,
          type: 'lost',
          status: 'lost',
          category: item.category,
        });

        for (const lostReport of matchingLostReports) {
          lostReport.status = 'returned';
          lostReport.history.push({
            fromStatus: 'lost',
            toStatus: 'returned',
            changedBy: req.user._id,
            note: `Successfully reunited with found item report "${item.title}"!`,
            handoverLocation: handoverLocation || '',
          });
          await lostReport.save();
        }
      }
    }

    // Notify approved claimants if item is marked returned or handed over
    const claims = await Claim.find({ item: item._id, status: { $in: ['approved', 'under_review'] } });
    for (const claim of claims) {
      await createNotification({
        recipient: claim.claimant,
        type: status === 'returned' ? 'item_returned' : 'handover_update',
        title: status === 'returned' ? `🎉 Item "${item.title}" Marked as Returned!` : `Status Update on "${item.title}"`,
        message: status === 'returned'
          ? `The item "${item.title}" has been successfully marked as RETURNED. Handover completed safely!`
          : `The item status has been updated to "${status}". Note: ${note || 'Status updated.'}`,
        relatedItem: item._id,
        relatedClaim: claim._id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Item status updated to ${status}`,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an item report
// @route   DELETE /api/items/:id
export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    const isOwner = item.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You cannot delete this item listing.',
      });
    }

    await Item.findByIdAndDelete(req.params.id);
    // Remove associated claims
    await Claim.deleteMany({ item: req.params.id });

    await logAudit({
      actor: req.user._id,
      action: 'ITEM_DELETED',
      targetType: 'Item',
      targetId: item._id,
      metadata: { title: item.title },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Item listing and associated claims removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports owned by current authenticated user
// @route   GET /api/items/mine
export const getMyItems = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const query = { owner: req.user._id };

    if (type && ['lost', 'found'].includes(type)) {
      query.type = type;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const items = await Item.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate matches for a specific item
// @route   GET /api/items/:id/matches
export const getItemMatches = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    const matches = await findMatchesForItem(item._id, 15);

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};
