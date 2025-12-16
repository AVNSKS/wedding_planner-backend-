const Reminder = require('../models/Reminder');
const Wedding = require('../models/Wedding');
const Guest = require('../models/Guest');
const { getUserWedding } = require('../utils/weddingHelpers');

// @desc    Create new reminder
// @route   POST /api/reminders
// @access  Private (Couple only)
exports.createReminder = async (req, res) => {
  try {
    const { title, dateTime, type, notes, weddingId } = req.body;

    const wedding = await getUserWedding(req.user.id, weddingId);

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'Please create a wedding first'
      });
    }

    const reminder = await Reminder.create({
      wedding: wedding._id,
      title,
      dateTime,
      type,
      notes
    });

    res.status(201).json({
      success: true,
      reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all reminders for my wedding
// @route   GET /api/reminders?weddingId=xxx
// @access  Private (Couple only)
exports.getMyReminders = async (req, res) => {
  try {
    const { weddingId } = req.query;
    const wedding = await getUserWedding(req.user.id, weddingId);

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'No wedding found'
      });
    }

    const reminders = await Reminder.find({ wedding: wedding._id }).sort('dateTime');

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private (Couple only)
exports.updateReminder = async (req, res) => {
  try {
    let reminder = await Reminder.findById(req.params.id).populate('wedding');

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Check ownership
    if (reminder.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private (Couple only)
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id).populate('wedding');

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    if (reminder.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await reminder.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reminders for dashboard (returns pending RSVP guests as reminders)
// @route   GET /api/reminders
// @access  Private (Couple only)
exports.getReminders = async (req, res) => {
  try {
    const { weddingId } = req.query;
    const wedding = await getUserWedding(req.user.id, weddingId);

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'No wedding found'
      });
    }

    // Get reminders from Reminder model
    const reminders = await Reminder.find({ wedding: wedding._id }).sort('dateTime');

    // Get pending RSVP guests as reminders
    const pendingGuests = await Guest.find({
      wedding: wedding._id,
      rsvpStatus: 'pending'
    }).limit(5);

    // Convert pending guests to reminder format for dashboard
    const guestReminders = pendingGuests.map(guest => ({
      _id: guest._id,
      title: `RSVP pending: ${guest.name}`,
      dateTime: null,
      type: 'rsvp',
      notes: `Awaiting response from ${guest.name}`
    }));

    // Combine both types
    const allReminders = [...reminders, ...guestReminders];

    res.status(200).json({
      success: true,
      count: allReminders.length,
      reminders: allReminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get RSVP reminders (pending guests)
// @route   GET /api/reminders/rsvp
// @access  Private (Couple only)
exports.getRsvpReminders = async (req, res) => {
  try {
    const { weddingId } = req.query;
    const wedding = await getUserWedding(req.user.id, weddingId);

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'No wedding found'
      });
    }

    const pendingGuests = await Guest.find({
      wedding: wedding._id,
      rsvpStatus: 'pending'
    });

    res.status(200).json({
      success: true,
      count: pendingGuests.length,
      guests: pendingGuests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send day-before reminders
// @route   POST /api/reminders/day-before
// @access  Private (Admin/System)
exports.sendDayBeforeReminders = async (req, res) => {
  try {
    // This would be called by a cron job
    // Send reminder emails to couples with weddings tomorrow
    res.status(200).json({
      success: true,
      message: 'Day-before reminders sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};