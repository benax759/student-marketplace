const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');

// @route GET /api/chat - Get all chats for user
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name avatar college')
      .populate('listing', 'title images price')
      .sort({ lastMessageAt: -1 });
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route POST /api/chat/start - Start or get a chat
router.post('/start', protect, async (req, res) => {
  try {
    const { recipientId, listingId } = req.body;

    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, recipientId] },
      listing: listingId,
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, recipientId],
        listing: listingId,
      });
    }

    await chat.populate('participants', 'name avatar college');
    await chat.populate('listing', 'title images price');

    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route GET /api/chat/:chatId - Get chat messages
router.get('/:chatId', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'name avatar college')
      .populate('listing', 'title images price status')
      .populate('messages.sender', 'name avatar');

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const isParticipant = chat.participants.some(
      p => p._id.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ message: 'Access denied' });

    // Mark messages as read
    chat.messages.forEach(msg => {
      if (msg.sender._id.toString() !== req.user._id.toString()) {
        msg.read = true;
      }
    });
    await chat.save();

    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route POST /api/chat/:chatId/message - Send a message
router.post('/:chatId/message', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const isParticipant = chat.participants.includes(req.user._id);
    if (!isParticipant) return res.status(403).json({ message: 'Access denied' });

    const message = {
      sender: req.user._id,
      content: req.body.content,
    };

    chat.messages.push(message);
    chat.lastMessage = req.body.content;
    chat.lastMessageAt = new Date();
    await chat.save();

    const io = req.app.get('io');
    io.to(req.params.chatId).emit('receive_message', {
      ...message,
      sender: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
      createdAt: new Date(),
    });

    res.json({ message: chat.messages[chat.messages.length - 1] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
