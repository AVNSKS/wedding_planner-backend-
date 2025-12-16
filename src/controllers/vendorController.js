const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { getUserWedding } = require('../utils/weddingHelpers');

// @desc    Create vendor profile
// @route   POST /api/vendors
// @access  Private (Vendor role only)
exports.createVendorProfile = async (req, res) => {
  try {
    const {
      businessName,
      category,
      description,
      services,
      location,
      city,
      priceRange,
      portfolio
    } = req.body;

    // Check if vendor profile already exists
    const existingVendor = await Vendor.findOne({ user: req.user.id });

    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor profile already exists'
      });
    }

    const vendor = await Vendor.create({
      user: req.user.id,
      businessName,
      category,
      description,
      services,
      location,
      city,
      priceRange,
      portfolio
    });

    res.status(201).json({
      success: true,
      vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all vendors (with filters)
// @route   GET /api/vendors
// @access  Public
exports.getAllVendors = async (req, res) => {
  try {
    const { category, city, minPrice, maxPrice, search } = req.query;

    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by city
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query['priceRange.min'] = {};
      if (minPrice) query['priceRange.min'].$gte = Number(minPrice);
      if (maxPrice) query['priceRange.max'] = { $lte: Number(maxPrice) };
    }

    // Search by business name
    if (search) {
      query.businessName = { $regex: search, $options: 'i' };
    }

    const vendors = await Vendor.find(query)
      .populate('user', 'name email phone')
      .sort('-ratingAverage');

    res.status(200).json({
      success: true,
      count: vendors.length,
      vendors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get vendor by ID
// @route   GET /api/vendors/:id
// @access  Public
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('reviews.wedding', 'brideName groomName');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my vendor profile
// @route   GET /api/vendors/my-profile
// @access  Private (Vendor only)
exports.getMyVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id })
      .populate('user', 'name email phone');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update vendor profile
// @route   PUT /api/vendors/:id
// @access  Private (Vendor only - own profile)
exports.updateVendorProfile = async (req, res) => {
  try {
    let vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check ownership
    if (vendor.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete vendor profile
// @route   DELETE /api/vendors/:id
// @access  Private (Vendor only - own profile)
exports.deleteVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (vendor.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this profile'
      });
    }

    await vendor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vendor profile deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add review to vendor
// @route   POST /api/vendors/:id/review
// @access  Private (Couple only)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get couple's wedding
    const Wedding = require('../models/Wedding');
    const { weddingId } = req.body;
    const wedding = await getUserWedding(req.user.id, weddingId);

    if (!wedding) {
      return res.status(400).json({
        success: false,
        message: 'Only couples with weddings can leave reviews'
      });
    }

    // Check if already reviewed
    const alreadyReviewed = vendor.reviews.find(
      r => r.wedding.toString() === wedding._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this vendor'
      });
    }

    // Add review
    vendor.reviews.push({
      wedding: wedding._id,
      rating,
      comment
    });

    // Update rating average
    vendor.ratingCount = vendor.reviews.length;
    vendor.ratingAverage =
      vendor.reviews.reduce((acc, item) => item.rating + acc, 0) /
      vendor.reviews.length;

    await vendor.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
