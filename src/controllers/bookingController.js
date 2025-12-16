const Booking = require('../models/Booking');
const Wedding = require('../models/Wedding');
const Vendor = require('../models/Vendor');
const Budget = require('../models/Budget');
const { getUserWedding } = require('../utils/weddingHelpers');


// @desc    Create booking request
// @route   POST /api/bookings
// @access  Private (Couple only)
exports.createBooking = async (req, res) => {
  try {
    const { 
      vendor, 
      serviceType, 
      vendorName,
      contactPerson,
      email,
      phone,
      address,
      eventDate, 
      totalAmount, 
      advancePaid,
      status,
      notes,
      weddingId 
    } = req.body;

    // Get couple's wedding
    const wedding = await getUserWedding(req.user.id, weddingId);

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'Please create a wedding first'
      });
    }

    // If vendor ID is provided, verify it exists
    if (vendor) {
      const vendorExists = await Vendor.findById(vendor);
      if (!vendorExists) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
      }
    }

    // Create booking with all provided fields
    const bookingData = {
      wedding: wedding._id,
      serviceType,
      eventDate,
      totalAmount: totalAmount || 0,
      advancePaid: advancePaid || 0,
      notes: notes || '',
      status: status || 'pending'
    };

    // Add vendor ID if provided
    if (vendor) {
      bookingData.vendor = vendor;
    }

    // Add manual vendor details if provided (for bookings without vendor in system)
    if (vendorName) bookingData.vendorName = vendorName;
    if (contactPerson) bookingData.contactPerson = contactPerson;
    if (email) bookingData.email = email;
    if (phone) bookingData.phone = phone;
    if (address) bookingData.address = address;

    const booking = await Booking.create(bookingData);

    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my bookings (for couple)
// @route   GET /api/bookings/my-bookings?weddingId=xxx
// @access  Private (Couple only)
exports.getMyBookings = async (req, res) => {
  try {
    const { weddingId } = req.query;
    const wedding = await getUserWedding(req.user.id, weddingId);

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'No wedding found'
      });
    }

    const bookings = await Booking.find({ wedding: wedding._id })
      .populate('vendor', 'businessName category location city')
      .populate('wedding', 'brideName groomName weddingDate')
      .sort('-createdAt');

    // Calculate stats
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      rejected: bookings.filter(b => b.status === 'rejected').length,
      totalAmount: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
      totalPaid: bookings.reduce((sum, b) => sum + b.advancePaid + b.finalPaid, 0)
    };

    res.status(200).json({
      success: true,
      count: bookings.length,
      stats,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get vendor's bookings
// @route   GET /api/bookings/vendor-bookings
// @access  Private (Vendor only)
exports.getVendorBookings = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const bookings = await Booking.find({ vendor: vendor._id })
      .populate('wedding', 'brideName groomName weddingDate venue city')
      .sort('-createdAt');

    // Calculate stats
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      rejected: bookings.filter(b => b.status === 'rejected').length,
      totalRevenue: bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.totalAmount, 0),
      receivedPayments: bookings.reduce((sum, b) => sum + b.advancePaid + b.finalPaid, 0)
    };

    res.status(200).json({
      success: true,
      count: bookings.length,
      stats,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vendor', 'businessName category location city user')
      .populate('wedding', 'brideName groomName weddingDate venue couple');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization (couple or vendor)
    const isCouple = booking.wedding.couple.toString() === req.user.id;
    const vendor = await Vendor.findById(booking.vendor._id);
    const isVendor = vendor && vendor.user.toString() === req.user.id;

    if (!isCouple && !isVendor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update booking (Couple edits booking details)
// @route   PUT /api/bookings/:id
// @access  Private (Couple only)
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('wedding');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this wedding
    if (booking.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Store old status before update
    const oldStatus = booking.status;
    
    // Update booking fields
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('vendor', 'businessName category');

    // If booking status changed to confirmed, create/update budget entry
    if (req.body.status === 'confirmed' && oldStatus !== 'confirmed') {
      try {
        // Map service type to budget category
        const serviceType = (updatedBooking.serviceType || '').toLowerCase();
        const categoryMap = {
          'venue': 'venue',
          'caterer': 'catering',
          'catering': 'catering',
          'photographer': 'photography',
          'photography': 'photography',
          'decorator': 'decoration',
          'decoration': 'decoration',
          'makeup': 'makeup',
          'dj': 'entertainment',
          'entertainment': 'entertainment',
          'transportation': 'transportation',
          'invitations': 'invitations',
          'favors': 'favors',
          'other': 'other'
        };
        
        const budgetCategory = categoryMap[serviceType] || 'other';
        
        // Check if budget entry already exists for this category
        const existingBudget = await Budget.findOne({
          wedding: updatedBooking.wedding,
          category: budgetCategory
        });

        if (existingBudget) {
          // Update existing budget with actual cost
          existingBudget.actualCost += updatedBooking.totalAmount;
          await existingBudget.save();
        } else {
          // Create new budget entry
          await Budget.create({
            wedding: updatedBooking.wedding,
            category: budgetCategory,
            estimatedCost: updatedBooking.totalAmount,
            actualCost: updatedBooking.totalAmount,
            notes: `Auto-created from booking: ${updatedBooking.vendor?.businessName || updatedBooking.vendorName || 'Vendor'}`
          });
        }
      } catch (budgetError) {
        console.error('Failed to sync booking with budget:', budgetError);
        // Don't fail the booking update if budget sync fails
      }
    }

    res.status(200).json({
      success: true,
      booking: updatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update booking status (Vendor accepts/rejects)
// @route   PUT /api/bookings/:id/status
// @access  Private (Vendor only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Use "confirmed" or "rejected"'
      });
    }

    const booking = await Booking.findById(req.params.id).populate('vendor');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this vendor
    const vendor = await Vendor.findById(booking.vendor._id);
    if (vendor.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update payment
// @route   PUT /api/bookings/:id/payment
// @access  Private (Couple only)
exports.updatePayment = async (req, res) => {
  try {
    const { advancePaid, finalPaid } = req.body;

    const booking = await Booking.findById(req.params.id).populate('wedding');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this wedding
    if (booking.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update payment'
      });
    }

    if (advancePaid !== undefined) booking.advancePaid = advancePaid;
    if (finalPaid !== undefined) booking.finalPaid = finalPaid;

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      booking,
      remainingAmount: booking.remainingAmount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Sync all confirmed bookings with budget
// @route   POST /api/bookings/sync-budget
// @access  Private (Couple only)
exports.syncBookingsToBudget = async (req, res) => {
  try {
    const wedding = await Wedding.findOne({ couple: req.user.id });
    if (!wedding) {
      return res.status(404).json({ success: false, message: 'No wedding found' });
    }

    const confirmedBookings = await Booking.find({ 
      wedding: wedding._id, 
      status: 'confirmed' 
    }).populate('vendor', 'businessName');

    let syncedCount = 0;
    const errors = [];

    for (const booking of confirmedBookings) {
      try {
        const serviceType = (booking.serviceType || '').toLowerCase();
        const categoryMap = {
          'venue': 'venue',
          'caterer': 'catering',
          'catering': 'catering',
          'photographer': 'photography',
          'photography': 'photography',
          'decorator': 'decoration',
          'decoration': 'decoration',
          'makeup': 'makeup',
          'dj': 'entertainment',
          'entertainment': 'entertainment',
          'transportation': 'transportation',
          'invitations': 'invitations',
          'favors': 'favors',
          'other': 'other'
        };
        
        const budgetCategory = categoryMap[serviceType] || 'other';
        
        const existingBudget = await Budget.findOne({
          wedding: wedding._id,
          category: budgetCategory
        });

        if (existingBudget) {
          // Check if this amount is already included
          if (existingBudget.actualCost < booking.totalAmount) {
            existingBudget.actualCost = booking.totalAmount;
            if (existingBudget.estimatedCost < booking.totalAmount) {
              existingBudget.estimatedCost = booking.totalAmount;
            }
            await existingBudget.save();
            syncedCount++;
          }
        } else {
          await Budget.create({
            wedding: wedding._id,
            category: budgetCategory,
            estimatedCost: booking.totalAmount,
            actualCost: booking.totalAmount,
            notes: `Synced from booking: ${booking.vendor?.businessName || booking.vendorName || 'Vendor'}`
          });
          syncedCount++;
        }
      } catch (err) {
        errors.push({ bookingId: booking._id, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Synced ${syncedCount} bookings to budget`,
      syncedCount,
      totalConfirmed: confirmedBookings.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private (Couple only)
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('wedding');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this booking'
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
