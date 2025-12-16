const Event = require('../models/Event');
const Wedding = require('../models/Wedding');
const { getUserWedding } = require('../utils/weddingHelpers');

// @desc    Add event to wedding
// @route   POST /api/events
// @access  Private (Couple only)
// exports.addEvent = async (req, res) => {
//   try {
//     const {
//       eventName,
//       customEventName,
//       eventDate,
//       eventTime,
//       venue,
//       venueAddress,
//       venueLatitude,
//       venueLongitude,
//       description,
//       dresscode
//     } = req.body;

//     // Get couple's wedding
//     const wedding = await Wedding.findOne({ couple: req.user.id });

//     if (!wedding) {
//       return res.status(404).json({
//         success: false,
//         message: 'Please create a wedding first'
//       });
//     }

//     const event = await Event.create({
//       wedding: wedding._id,
//       eventName,
//       customEventName,
//       eventDate,
//       eventTime,
//       venue,
//       venueAddress,
//       venueLatitude,
//       venueLongitude,
//       description,
//       dresscode
//     });

//     res.status(201).json({
//       success: true,
//       event
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

exports.addEvent = async (req, res) => {
  try {
    const {
      eventName,
      customEventName,
      eventDate,
      eventTime,
      venue,
      venueAddress,
      venueLatitude,
      venueLongitude,
      description,
      dresscode,
      weddingId
    } = req.body;

    const wedding = await getUserWedding(req.user.id, weddingId);

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'Please create a wedding first'
      });
    }

    // Generate Google Maps link here
    let googleMapsLink = '';
    if (venueLatitude && venueLongitude) {
      googleMapsLink = `https://www.google.com/maps?q=${venueLatitude},${venueLongitude}`;
    }

    const event = await Event.create({
      wedding: wedding._id,
      eventName,
      customEventName,
      eventDate,
      eventTime,
      venue,
      venueAddress,
      venueLatitude,
      venueLongitude,
      googleMapsLink,  // Add it here
      description,
      dresscode
    });

    res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all events for my wedding
// @route   GET /api/events?weddingId=xxx
// @access  Private (Couple only)
exports.getMyEvents = async (req, res) => {
  try {
    const { weddingId } = req.query;
    const wedding = await getUserWedding(req.user.id, weddingId);

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'No wedding found'
      });
    }

    const events = await Event.find({ wedding: wedding._id }).sort('eventDate');

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get events by wedding ID (Public - for guests)
// @route   GET /api/events/wedding/:weddingId
// @access  Public
exports.getEventsByWeddingId = async (req, res) => {
  try {
    const events = await Event.find({ wedding: req.params.weddingId })
      .sort('eventDate')
      .populate('wedding', 'brideName groomName');

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('wedding');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Couple only)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id).populate('wedding');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Auto-generate Google Maps link if coordinates provided
    if (req.body.venueLatitude && req.body.venueLongitude) {
      req.body.googleMapsLink = `https://www.google.com/maps?q=${req.body.venueLatitude},${req.body.venueLongitude}`;
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Couple only)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('wedding');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
