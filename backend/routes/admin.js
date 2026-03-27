const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// @route GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalListings, activeListings, reportedListings] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Listing.countDocuments({ isActive: true }),
      Listing.countDocuments({ 'reports.0': { $exists: true } }),
    ]);

    res.json({ totalUsers, totalListings, activeListings, reportedListings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]} : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/admin/users/:id/toggle
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot deactivate admin' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/admin/listings
router.get('/listings', async (req, res) => {
  try {
    const { page = 1, limit = 20, reported } = req.query;
    const query = reported === 'true' ? { 'reports.0': { $exists: true } } : {};

    const listings = await Listing.find(query)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Listing.countDocuments(query);
    res.json({ listings, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/admin/listings/:id/toggle
router.put('/listings/:id/toggle', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    listing.isActive = !listing.isActive;
    await listing.save();
    res.json({ message: `Listing ${listing.isActive ? 'restored' : 'removed'}`, listing });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/admin/listings/:id/feature
router.put('/listings/:id/feature', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    listing.isFeatured = !listing.isFeatured;
    await listing.save();
    res.json({ message: `Listing ${listing.isFeatured ? 'featured' : 'unfeatured'}`, listing });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
