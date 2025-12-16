const Guest = require('../models/Guest');
const Wedding = require('../models/Wedding');
const nodemailer = require('nodemailer');
const { sendRsvpConfirmationEmail } = require('../utils/emailTemplates');
const { getUserWedding } = require('../utils/weddingHelpers');

// @desc    Add guest to wedding
// @route   POST /api/guests
// @access  Private (Couple only)
exports.addGuest = async (req, res) => {
  try {
    const { name, email, phone, category, plusOneAllowed, weddingId } = req.body;

    // Get couple's wedding - use provided weddingId or most recent
    let wedding;
    if (weddingId) {
      wedding = await Wedding.findOne({ _id: weddingId, couple: req.user.id });
    } else {
      wedding = await Wedding.findOne({ couple: req.user.id }).sort({ createdAt: -1 });
    }

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'Please create a wedding first'
      });
    }

    // Create guest with auto-generated RSVP token
    const guest = await Guest.create({
      wedding: wedding._id,
      name,
      email,
      phone,
      category,
      plusOneAllowed
    });

    res.status(201).json({
      success: true,
      guest,
      rsvpLink: `${process.env.FRONTEND_URL}/rsvp/${guest.rsvpToken}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all guests for my wedding
// @route   GET /api/guests?weddingId=xxx
// @access  Private (Couple only)
exports.getMyGuests = async (req, res) => {
  try {
    const { weddingId } = req.query;
    
    // Get wedding - use provided weddingId or most recent
    let wedding;
    if (weddingId) {
      wedding = await Wedding.findOne({ _id: weddingId, couple: req.user.id });
    } else {
      wedding = await Wedding.findOne({ couple: req.user.id }).sort({ createdAt: -1 });
    }

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'No wedding found'
      });
    }

    const guests = await Guest.find({ wedding: wedding._id });

    // Calculate RSVP stats
    const stats = {
      total: guests.length,
      confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
      declined: guests.filter(g => g.rsvpStatus === 'declined').length,
      pending: guests.filter(g => g.rsvpStatus === 'pending').length,
      totalAttendees: guests.reduce((sum, g) => sum + (g.rsvpStatus === 'confirmed' ? g.attendeesCount : 0), 0)
    };

    // Dietary preferences summary
    const dietarySummary = {};
    guests.forEach(guest => {
      if (guest.rsvpStatus === 'confirmed') {
        guest.dietaryPreferences.forEach(pref => {
          dietarySummary[pref] = (dietarySummary[pref] || 0) + 1;
        });
      }
    });

    res.status(200).json({
      success: true,
      count: guests.length,
      stats,
      dietarySummary,
      guests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update guest
// @route   PUT /api/guests/:id
// @access  Private (Couple only)
exports.updateGuest = async (req, res) => {
  try {
    let guest = await Guest.findById(req.params.id).populate('wedding');

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    // Check if this guest belongs to user's wedding
    if (guest.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    guest = await Guest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      guest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete guest
// @route   DELETE /api/guests/:id
// @access  Private (Couple only)
exports.deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id).populate('wedding');

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    if (guest.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await guest.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Guest deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get guest by RSVP token (Public route)
// @route   GET /api/rsvp/:token
// @access  Public
exports.getGuestByToken = async (req, res) => {
  try {
    const guest = await Guest.findOne({ rsvpToken: req.params.token })
      .populate('wedding', 'brideName groomName weddingDate venue city');

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Invalid RSVP link'
      });
    }

    res.status(200).json({
      success: true,
      guest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Submit RSVP (Public route)
// @route   POST /api/rsvp/:token
// @access  Public
exports.submitRSVP = async (req, res) => {
  console.log('🔥🔥🔥 SUBMIT RSVP FUNCTION CALLED 🔥🔥🔥');
  console.log('Token:', req.params.token);
  console.log('Body:', req.body);
  
  try {
    const { rsvpStatus, attendeesCount, dietaryPreferences, allergies, customResponses } = req.body;

    const guest = await Guest.findOne({ rsvpToken: req.params.token })
      .populate('wedding', 'brideName groomName date venue weddingDate');

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Invalid RSVP link'
      });
    }

    // Update guest RSVP
    guest.rsvpStatus = rsvpStatus;
    guest.attendeesCount = attendeesCount || 1;
    guest.dietaryPreferences = dietaryPreferences || [];
    guest.allergies = allergies || '';
    guest.customResponses = customResponses || '';
    guest.respondedAt = Date.now();

    await guest.save();

    console.log('=============================================');
    console.log('RSVP SUBMITTED - Starting email process...');
    console.log('Guest Name:', guest.name);
    console.log('Guest Email:', guest.email);
    console.log('RSVP Status:', guest.rsvpStatus);
    console.log('=============================================');

    // Send confirmation email with wedding invitation link
    try {
      if (guest.email) {
        console.log('✉️  Attempting to send email to:', guest.email);
        const wedding = guest.wedding;
        
        // For declined guests, only send acknowledgment - not full invitation
        if (guest.rsvpStatus === 'declined') {
          console.log('📧 Guest declined - sending simple acknowledgment');
          // Simple acknowledgment handled by the email template
          const publicLink = `${process.env.FRONTEND_URL}/wedding/${guest.rsvpToken}`;
          
          await sendRsvpConfirmationEmail({
            to: guest.email,
            guestName: guest.name,
            wedding: {
              groomName: wedding.groomName,
              brideName: wedding.brideName,
              date: wedding.date || wedding.weddingDate,
              venue: wedding.venue,
              city: wedding.city
            },
            rsvpStatus: 'declined',
            attendeesCount: 0,
            publicLink,
            isDeclined: true
          });
          
          console.log('✅ Decline acknowledgment sent to:', guest.email);
        } else {
          // For confirmed/maybe guests, send full invitation details
          const publicLink = `${process.env.FRONTEND_URL}/wedding/${guest.rsvpToken}`;

          console.log('Wedding data:', {
            groomName: wedding.groomName,
            brideName: wedding.brideName,
            date: wedding.date || wedding.weddingDate,
            venue: wedding.venue,
            city: wedding.city
          });

          await sendRsvpConfirmationEmail({
            to: guest.email,
            guestName: guest.name,
            wedding: {
              groomName: wedding.groomName,
              brideName: wedding.brideName,
              date: wedding.date || wedding.weddingDate,
              venue: wedding.venue,
              city: wedding.city
            },
            rsvpStatus: guest.rsvpStatus,
            attendeesCount: guest.attendeesCount,
            publicLink
          });

          console.log('=============================================');
          console.log('✅ EMAIL SENT SUCCESSFULLY!');
          console.log('Email sent to:', guest.email);
          console.log('=============================================');
        }
      } else {
        console.log('=============================================');
        console.log('⚠️  NO EMAIL ADDRESS - Email not sent');
        console.log('=============================================');
      }
    } catch (emailError) {
      // Log error but don't fail the request
      console.log('=============================================');
      console.error('❌ EMAIL FAILED!');
      console.error('Error:', emailError.message);
      console.error('Full error:', emailError);
      console.log('=============================================');
    }

    res.status(200).json({
      success: true,
      message: 'RSVP submitted successfully',
      guest,
      publicLink: `${process.env.FRONTEND_URL}/wedding/${guest.rsvpToken}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send email invitations to all guests
// @route   POST /api/guests/send-invitations
// @access  Private (Couple only)
exports.sendInvitations = async (req, res) => {
  try {
    const { weddingId } = req.body;
    const wedding = await getUserWedding(req.user.id, weddingId);

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'No wedding found'
      });
    }

    const guests = await Guest.find({ wedding: wedding._id, email: { $exists: true, $ne: '' } });

    // Setup email transporter (using Gmail example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    let sentCount = 0;

    // Send email to each guest
    for (const guest of guests) {
      const rsvpLink = `${process.env.FRONTEND_URL}/rsvp/${guest.rsvpToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: guest.email,
        subject: `You're Invited! ${wedding.brideName} & ${wedding.groomName}'s Wedding`,
        html: `
          <h2>Wedding Invitation</h2>
          <p>Dear ${guest.name},</p>
          <p>You are cordially invited to the wedding of <strong>${wedding.brideName}</strong> and <strong>${wedding.groomName}</strong>!</p>
          <p><strong>Date:</strong> ${new Date(wedding.weddingDate).toLocaleDateString()}</p>
          <p><strong>Venue:</strong> ${wedding.venue}, ${wedding.city}</p>
          <p>Please RSVP by clicking the link below:</p>
          <a href="${rsvpLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">RSVP Now</a>
          <p>Or copy this link: ${rsvpLink}</p>
          <p>We look forward to celebrating with you!</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send to ${guest.email}:`, emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: `Invitations sent to ${sentCount} out of ${guests.length} guests`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
