import Claim, { CLAIM_STATUSES } from '../models/Claim.js';
import Item from '../models/Item.js';
import Conversation from '../models/Conversation.js';
import { processUploadedFiles } from '../middleware/uploadMiddleware.js';
import { createNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';

// @desc    Submit an ownership claim on a found item
// @route   POST /api/items/:id/claims
export const submitClaim = async (req, res, next) => {
  try {
    const { explanation, secretIdentifiers } = req.body;
    const itemId = req.params.id;

    if (!explanation || explanation.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a detailed explanation of ownership (at least 10 characters)',
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit an ownership claim against your own reported item',
      });
    }

    if (item.status === 'returned' || item.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'This item report is already marked as returned or closed',
      });
    }

    // Check if user already has an active claim
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
      status: { $in: ['pending', 'under_review', 'approved'] },
    });

    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active claim submitted for this item',
      });
    }

    // Process uploaded private evidence files
    let evidenceUrls = [];
    if (req.files && req.files.length > 0) {
      evidenceUrls = await processUploadedFiles(req.files, req);
    } else if (req.body.privateEvidence) {
      evidenceUrls = Array.isArray(req.body.privateEvidence)
        ? req.body.privateEvidence
        : [req.body.privateEvidence];
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      explanation: explanation.trim(),
      secretIdentifiers: secretIdentifiers ? secretIdentifiers.trim() : '',
      privateEvidence: evidenceUrls,
      status: 'pending',
    });

    await logAudit({
      actor: req.user._id,
      action: 'CLAIM_SUBMITTED',
      targetType: 'Claim',
      targetId: claim._id,
      metadata: { itemId: item._id, itemTitle: item.title },
      req,
    });

    // Automatically send initial message from claimant to owner and establish conversation
    const isLostItem = item.type === 'lost';
    const explanationText = explanation ? explanation.trim() : '';

    let claimMessageText = '';
    if (isLostItem) {
      if (
        explanationText.toLowerCase().startsWith('i found') ||
        explanationText.toLowerCase().startsWith('found') ||
        explanationText.toLowerCase().startsWith('i just found')
      ) {
        claimMessageText = explanationText;
      } else {
        claimMessageText = `I found this item: "${explanationText}"`;
      }
    } else {
      if (
        explanationText.toLowerCase().startsWith('i lost') ||
        explanationText.toLowerCase().startsWith('lost') ||
        explanationText.toLowerCase().startsWith('this is my')
      ) {
        claimMessageText = explanationText;
      } else {
        claimMessageText = `I lost this item: "${explanationText}"`;
      }
    }

    let conversation = await Conversation.findOne({
      relatedItem: item._id,
      participants: { $all: [req.user._id, item.owner] },
    });

    const messageObj = {
      sender: req.user._id,
      text: claimMessageText,
      timestamp: new Date(),
      isRead: false,
    };

    if (conversation) {
      conversation.messages.push(messageObj);
      conversation.lastMessageAt = new Date();
      await conversation.save();
    } else {
      conversation = await Conversation.create({
        participants: [req.user._id, item.owner],
        initiator: req.user._id,
        relatedItem: item._id,
        subject: `Regarding: ${item.title}`,
        status: 'pending',
        messages: [messageObj],
        lastMessageAt: new Date(),
      });
    }

    // Notify item owner with the exact message from claimant and link directly to conversation
    await createNotification({
      recipient: item.owner,
      type: 'new_message',
      title: isLostItem
        ? `Someone Found Your Item "${item.title}"!`
        : `New Ownership Claim on "${item.title}"`,
      message: `${req.user.name}: "${claimMessageText}"`,
      relatedItem: item._id,
      relatedClaim: claim._id,
      relatedConversation: conversation._id,
      sendEmailNotification: true,
    });

    res.status(201).json({
      success: true,
      message: isLostItem
        ? 'Your found report has been submitted to the owner'
        : 'Your claim has been submitted successfully for verification',
      claim,
      conversationId: conversation?._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all claims related to the current user (both submitted and received on user's found items)
// @route   GET /api/claims/mine
export const getMyClaims = async (req, res, next) => {
  try {
    // 1. Claims submitted by this user (claims on found items or reports on lost items)
    const submittedClaimsRaw = await Claim.find({ claimant: req.user._id })
      .populate({
        path: 'item',
        populate: { path: 'owner', select: 'name email avatar phone' },
      })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });

    // 2. Find all items reported by this user (e.g. found belongings)
    const ItemModel = (await import('../models/Item.js')).default;
    const userItems = await ItemModel.find({ owner: req.user._id }).select('_id');
    const userItemIds = userItems.map((i) => i._id);

    // 3. Claims received on items reported by this user (submitted by other users)
    const receivedClaimsRaw = await Claim.find({
      item: { $in: userItemIds },
      claimant: { $ne: req.user._id },
    })
      .populate('item')
      .populate('claimant', 'name email avatar phone')
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });

    // Attach conversationId if conversation exists
    const Conversation = (await import('../models/Conversation.js')).default;

    const receivedClaims = await Promise.all(
      receivedClaimsRaw.map(async (c) => {
        let conversationId = null;
        if (c.item && c.claimant) {
          const conv = await Conversation.findOne({
            relatedItem: c.item._id,
            participants: { $all: [c.claimant._id, req.user._id] },
          });
          conversationId = conv?._id || null;
        }
        return {
          ...c.toObject(),
          conversationId,
        };
      })
    );

    const submittedClaims = await Promise.all(
      submittedClaimsRaw.map(async (c) => {
        let conversationId = null;
        if (c.item && c.item.owner) {
          const conv = await Conversation.findOne({
            relatedItem: c.item._id,
            participants: { $all: [req.user._id, c.item.owner] },
          });
          conversationId = conv?._id || null;
        }
        return {
          ...c.toObject(),
          conversationId,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: submittedClaims.length + receivedClaims.length,
      claims: submittedClaims, // for backwards-compatibility
      submittedClaims,
      receivedClaims,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single claim by ID (with privacy enforcement)
// @route   GET /api/claims/:id
export const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('item')
      .populate('claimant', 'name email phone avatar')
      .populate('reviewer', 'name');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const isClaimant = claim.claimant._id.toString() === req.user._id.toString();
    const isItemOwner = claim.item.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isClaimant && !isItemOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this claim.',
      });
    }

    // Find if a conversation already exists between claimant and item owner
    const existingConversation = await Conversation.findOne({
      relatedItem: claim.item._id,
      participants: { $all: [claim.claimant._id, claim.item.owner] },
    });

    res.status(200).json({
      success: true,
      claim,
      canReview: !isClaimant && (isItemOwner || isAdmin),
      isClaimant,
      conversationId: existingConversation?._id || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update claim status (Review, Approve, Reject, or Withdraw)
// @route   PATCH /api/claims/:id
export const updateClaimStatus = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!status || !CLAIM_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Valid status must be one of: ${CLAIM_STATUSES.join(', ')}`,
      });
    }

    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const isClaimant = claim.claimant.toString() === req.user._id.toString();
    const isItemOwner = claim.item.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Claimant can only withdraw their own claim
    if (isClaimant && status !== 'withdrawn') {
      return res.status(403).json({
        success: false,
        message: 'As the sender/claimant, you cannot review or approve your own claim.',
      });
    }

    // Only item owner or admin can review, approve, or reject
    if (!isItemOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the item owner or administrator can review this claim.',
      });
    }

    const prevStatus = claim.status;
    claim.status = status;
    if (reviewNotes !== undefined) {
      claim.reviewNotes = reviewNotes.trim();
    }

    if (['approved', 'rejected', 'under_review'].includes(status)) {
      claim.reviewer = req.user._id;
      claim.reviewedAt = new Date();
    }

    await claim.save();

    await logAudit({
      actor: req.user._id,
      action: `CLAIM_STATUS_${status.toUpperCase()}`,
      targetType: 'Claim',
      targetId: claim._id,
      metadata: { fromStatus: prevStatus, toStatus: status },
      req,
    });

    let unlockedConversationId = null;

    // When a claim is approved, unlock private messaging between claimant and item owner!
    if (status === 'approved') {
      let conversation = await Conversation.findOne({
        relatedItem: claim.item._id,
        participants: { $all: [claim.claimant, claim.item.owner] },
      });

      const isLostItem = claim.item.type === 'lost';
      const approvalNote = isLostItem
        ? `🎉 System Notice: Lost item report for "${claim.item.title}" has been verified and confirmed with the finder. You can now safely communicate here to coordinate safe return (recommended meetup: Main Security Desk or Reception Desk).`
        : `🎉 System Notice: Ownership claim on "${claim.item.title}" has been verified and APPROVED by ${
            isAdmin ? 'the Administrator' : 'the finder'
          }. You can now safely communicate here to coordinate item handover (recommended handover point: Main Security Desk or Reception Desk).`;

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [claim.claimant, claim.item.owner],
          initiator: req.user._id,
          relatedItem: claim.item._id,
          subject: `Handover Coordination: ${claim.item.title}`,
          status: 'active',
          messages: [
            {
              sender: req.user._id,
              text: approvalNote,
              timestamp: new Date(),
              isRead: false,
            },
          ],
          lastMessageAt: new Date(),
        });
      } else {
        conversation.status = 'active';
        conversation.messages.push({
          sender: req.user._id,
          text: approvalNote,
          timestamp: new Date(),
          isRead: false,
        });
        conversation.lastMessageAt = new Date();
        await conversation.save();
      }

      unlockedConversationId = conversation._id;

      // Notify the item owner if approved by admin
      if (isAdmin && claim.item.owner.toString() !== req.user._id.toString()) {
        await createNotification({
          recipient: claim.item.owner,
          type: 'claim_status',
          title: `Claim on "${claim.item.title}" Verified by Admin`,
          message: `The ownership claim has been verified and approved. A private chat is now active to coordinate the handover.`,
          relatedItem: claim.item._id,
          relatedClaim: claim._id,
          relatedConversation: conversation._id,
          sendEmailNotification: true,
        });
      }
    }

    // Notify claimant about decision
    if (isItemOwner || isAdmin) {
      await createNotification({
        recipient: claim.claimant,
        type: 'claim_status',
        title: `Claim on "${claim.item.title}" ${status.replace('_', ' ').toUpperCase()}`,
        message:
          status === 'approved'
            ? `Congratulations! Your ownership claim has been APPROVED. You can now chat privately with the finder to arrange the item handover.`
            : `Your ownership claim has been marked as "${status}". Review notes: ${
                reviewNotes || 'No additional notes provided.'
              }`,
        relatedItem: claim.item._id,
        relatedClaim: claim._id,
        relatedConversation: unlockedConversationId,
        sendEmailNotification: true,
      });
    }

    res.status(200).json({
      success: true,
      message: `Claim status updated to ${status}`,
      claim,
      conversationId: unlockedConversationId,
    });
  } catch (error) {
    next(error);
  }
};
