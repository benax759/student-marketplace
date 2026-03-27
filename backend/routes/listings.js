const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @route GET /api/listings - Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const {
      search, category, minPrice, maxPrice,
      location, sort, page = 1, limit = 12,
      condition, status,
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (category && category !== 'All') query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (location) {
      query.$or = [
        { city: { $regex: location, $options: 'i' } },
        { college: { $regex: location, $options: 'i' } },
      ];
    }
    if (condition) query.condition = condition;
    if (status) query.status = status;
    else query.status = { $ne: 'sold' };

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'popular') sortOption = { views: -1 };

    const total = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .populate('seller', 'name avatar college city averageRating')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      listings,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route GET /api/listings/featured
router.get('/featured', async (req, res) => {
  try {
    const listings = await Listing.find({ isActive: true, isFeatured: true, status: { $ne: 'sold' } })
      .populate('seller', 'name avatar college averageRating')
      .sort({ createdAt: -1 })
      .limit(8);
    res.json({ listings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/listings/:id
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name avatar college city phone averageRating totalRatings createdAt');

    if (!listing || !listing.isActive) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Increment views
    listing.views += 1;
    await listing.save();

    // Related listings
    const related = await Listing.find({
      category: listing.category,
      _id: { $ne: listing._id },
      isActive: true,
      status: { $ne: 'sold' },
    })
      .populate('seller', 'name avatar')
      .limit(4);

    res.json({ listing, related });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route POST /api/listings - Create listing
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, price, category, condition, college, city } = req.body;

    const images = req.files ? req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
    })) : [];

    const listing = await Listing.create({
      title,
      description,
      price: Number(price),
      category,
      condition,
      college: college || req.user.college,
      city: city || req.user.city,
      images,
      seller: req.user._id,
    });

    await listing.populate('seller', 'name avatar college averageRating');

    res.status(201).json({
      message: 'Your listing is now live! 🎉',
      listing,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route PUT /api/listings/:id - Update listing
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, price, category, condition, college, city, status } = req.body;

    const newImages = req.files ? req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
    })) : [];

    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : listing.images;

    listing.title = title || listing.title;
    listing.description = description || listing.description;
    listing.price = price ? Number(price) : listing.price;
    listing.category = category || listing.category;
    listing.condition = condition || listing.condition;
    listing.college = college || listing.college;
    listing.city = city || listing.city;
    listing.status = status || listing.status;
    listing.images = [...existingImages, ...newImages];

    await listing.save();
    await listing.populate('seller', 'name avatar college averageRating');

    res.json({ message: 'Listing updated successfully', listing });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route DELETE /api/listings/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    listing.isActive = false;
    await listing.save();

    res.json({ message: 'Listing removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route POST /api/listings/:id/report
router.post('/:id/report', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const alreadyReported = listing.reports.find(
      r => r.reporter.toString() === req.user._id.toString()
    );
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this listing' });
    }

    listing.reports.push({ reporter: req.user._id, reason: req.body.reason });
    await listing.save();

    res.json({ message: 'Report submitted. Our team will review it shortly.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/listings/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const listings = await Listing.find({
      seller: req.params.userId,
      isActive: true,
    })
      .populate('seller', 'name avatar college averageRating')
      .sort({ createdAt: -1 });

    res.json({ listings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
