import Conversation from '../models/Conversation.js';
import Item from '../models/Item.js';
import { createNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';

// @desc    Start or retrieve an existing conversation regarding an item
// @route   POST /api/conversations
export const createOrGetConversation = async (req, res, next) => {
  try {
    const { itemId, recipientId, initialMessage, subject } = req.body;

    if (!itemId || !recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and recipient ID are required',
      });
    }

    if (recipientId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself',
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    // Check if conversation already exists between these 2 users for this item
    let conversation = await Conversation.findOne({
      relatedItem: itemId,
      participants: { $all: [req.user._id, recipientId] },
    })
      .populate('participants', 'name avatar')
      .populate('relatedItem', 'title type images status');

    if (conversation) {
      // If initialMessage was sent and conversation was already existing, append message
      if (initialMessage && initialMessage.trim()) {
        conversation.messages.push({
          sender: req.user._id,
          text: initialMessage.trim(),
          timestamp: new Date(),
          isRead: false,
        });
        conversation.lastMessageAt = new Date();
        await conversation.save();

        // Notify recipient
        await createNotification({
          recipient: recipientId,
          type: 'new_message',
          title: `New Message regarding "${item.title}"`,
          message: `${req.user.name}: "${initialMessage.trim().substring(0, 80)}..."`,
          relatedItem: item._id,
          relatedConversation: conversation._id,
        });
      }

      return res.status(200).json({
        success: true,
        conversation,
      });
    }

    // Create new conversation
    const messages = [];
    if (initialMessage && initialMessage.trim()) {
      messages.push({
        sender: req.user._id,
        text: initialMessage.trim(),
        timestamp: new Date(),
        isRead: false,
      });
    }

    conversation = await Conversation.create({
      participants: [req.user._id, recipientId],
      initiator: req.user._id,
      relatedItem: itemId,
      subject: subject || `Inquiry regarding ${item.title}`,
      status: 'pending',
      messages,
      lastMessageAt: new Date(),
    });

    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar')
      .populate('relatedItem', 'title type images status');

    await logAudit({
      actor: req.user._id,
      action: 'CONVERSATION_STARTED',
      targetType: 'Conversation',
      targetId: conversation._id,
      req,
    });

    // Notify recipient of contact request
    const contactPreview =
      initialMessage && initialMessage.trim()
        ? `${req.user.name}: "${initialMessage.trim().substring(0, 100)}"`
        : `${req.user.name} sent you a message regarding your report.`;

    await createNotification({
      recipient: recipientId,
      type: 'contact_request',
      title: `New Contact Request for "${item.title}"`,
      message: contactPreview,
      relatedItem: item._id,
      relatedConversation: conversation._id,
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/conversations
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar email')
      .populate('relatedItem', 'title type images status')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single conversation and its messages
// @route   GET /api/conversations/:id
export const getConversationById = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name avatar email phone')
      .populate('relatedItem', 'title type images status owner')
      .populate('messages.sender', 'name avatar');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant in this conversation.',
      });
    }

    // Mark messages as read for this user
    let modified = false;
    conversation.messages.forEach((msg) => {
      const senderId = (msg.sender?._id || msg.sender)?.toString();
      if (senderId && senderId !== req.user._id.toString() && !msg.isRead) {
        msg.isRead = true;
        modified = true;
      }
    });

    if (modified) {
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message within conversation
// @route   POST /api/conversations/:id/messages
export const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You cannot send messages in this conversation.',
      });
    }

    const newMessage = {
      sender: req.user._id,
      text: text.trim(),
      timestamp: new Date(),
      isRead: false,
    };

    conversation.messages.push(newMessage);
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Identify recipient
    const recipientId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    if (recipientId) {
      await createNotification({
        recipient: recipientId,
        type: 'new_message',
        title: `New message from ${req.user.name}`,
        message: text.trim().substring(0, 100),
        relatedConversation: conversation._id,
        relatedItem: conversation.relatedItem,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept or decline contact request
// @route   PATCH /api/conversations/:id/status
export const updateConversationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    conversation.status = status;
    await conversation.save();

    res.status(200).json({
      success: true,
      message: `Conversation status updated to ${status}`,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};
