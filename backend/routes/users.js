const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');

// @route GET /api/users/:id - Public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -wishlist -recentlyViewed')
      .populate('ratings.reviewer', 'name avatar');

    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/users/profile - Update profile
router.put('/profile/update', protect, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    const { name, bio, college, city, phone } = req.body;
    const user = await User.findById(req.user._id);

    user.name = name || user.name;
    user.bio = bio !== undefined ? bio : user.bio;
    user.college = college !== undefined ? college : user.college;
    user.city = city !== undefined ? city : user.city;
    user.phone = phone !== undefined ? phone : user.phone;

    if (req.file) {
      user.avatar = req.file.path;
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route POST /api/users/wishlist/:listingId - Toggle wishlist
router.post('/wishlist/:listingId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listingId = req.params.listingId;

    const index = user.wishlist.indexOf(listingId);
    let message;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      message = 'Removed from wishlist';
    } else {
      user.wishlist.push(listingId);
      message = 'Added to wishlist ❤️';
    }

    await user.save();
    res.json({ message, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/users/wishlist/items - Get wishlist
router.get('/wishlist/items', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: { path: 'seller', select: 'name avatar college' },
    });
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route POST /api/users/recently-viewed/:listingId
router.post('/recently-viewed/:listingId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listingId = req.params.listingId;

    user.recentlyViewed = user.recentlyViewed.filter(id => id.toString() !== listingId);
    user.recentlyViewed.unshift(listingId);
    user.recentlyViewed = user.recentlyViewed.slice(0, 10);

    await user.save();
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/users/recently-viewed/items
router.get('/recently-viewed/items', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'recentlyViewed',
      populate: { path: 'seller', select: 'name avatar' },
      options: { limit: 10 },
    });
    res.json({ recentlyViewed: user.recentlyViewed });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route POST /api/users/:id/rate - Rate a seller
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const seller = await User.findById(req.params.id);

    if (!seller) return res.status(404).json({ message: 'User not found' });
    if (seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't rate yourself" });
    }

    const existingRating = seller.ratings.find(
      r => r.reviewer.toString() === req.user._id.toString()
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment;
    } else {
      seller.ratings.push({ reviewer: req.user._id, rating, comment });
    }

    seller.calculateAverageRating();
    await seller.save();

    res.json({ message: 'Rating submitted! Thank you for your feedback.', seller });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
