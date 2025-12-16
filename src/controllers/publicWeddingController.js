const Wedding = require('../models/Wedding');
const Event = require('../models/Event');
const Guest = require('../models/Guest');

// @desc    Get public wedding info by guest RSVP token
// @route   GET /api/public/wedding/:token
// @access  Public (for guests)
exports.getWeddingInfoByToken = async (req, res) => {
  try {
    const guest = await Guest.findOne({ rsvpToken: req.params.token })
      .populate('wedding', 'brideName groomName weddingDate venue venueAddress city hashtag googleMapsLink');

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Invalid link'
      });
    }

    const events = await Event.find({ wedding: guest.wedding._id }).sort('eventDate');

    res.status(200).json({
      success: true,
      guest: {
        name: guest.name,
        category: guest.category
      },
      wedding: guest.wedding,
      events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
