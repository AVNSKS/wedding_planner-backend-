const Wedding = require('../models/Wedding');
const User = require('../models/User');

// @desc    Create new wedding
// @route   POST /api/weddings
// @access  Private (Couple only)
const generateHashtag = (brideName, groomName, year) => {
  const bride = brideName.split(' ')[0]; // First name only
  const groom = groomName.split(' ')[0];
  return `#${groom}Weds${bride}${year}`;
};

// Update createWedding function
exports.createWedding = async (req, res) => {
  try {
    const { 
      brideName, 
      groomName, 
      weddingDate, 
      venue, 
      venueAddress,
      venueLatitude,
      venueLongitude,
      city, 
      totalBudget, 
      theme, 
      notes 
    } = req.body;

    // Removed single wedding restriction - users can now create multiple weddings
    // const existingWedding = await Wedding.findOne({ couple: req.user.id });
    // if (existingWedding) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'You already have a wedding created'
    //   });
    // }

    // Auto-generate hashtag
    const year = new Date(weddingDate).getFullYear();
    const hashtag = generateHashtag(brideName, groomName, year);

    const wedding = await Wedding.create({
      couple: req.user.id,
      brideName,
      groomName,
      weddingDate,
      venue,
      venueAddress,
      venueLatitude,
      venueLongitude,
      city,
      totalBudget,
      theme,
      notes,
      hashtag
    });

    console.log('✅ Wedding created:', wedding);
    res.status(201).json({
      success: true,
      wedding
    });
    console.log('✅ Response sent');
  } catch (error) {
    console.error('❌ Error creating wedding:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

//old
// exports.createWedding = async (req, res) => {
//   try {
//     const { brideName, groomName, weddingDate, venue, city, totalBudget, theme, notes } = req.body;

//     // Check if couple already has a wedding
//     const existingWedding = await Wedding.findOne({ couple: req.user.id });
    
//     if (existingWedding) {
//       return res.status(400).json({
//         success: false,
//         message: 'You already have a wedding created'
//       });
//     }

//     // Create wedding
//     const wedding = await Wedding.create({
//       couple: req.user.id,
//       brideName,
//       groomName,
//       weddingDate,
//       venue,
//       city,
//       totalBudget,
//       theme,
//       notes
//     });

//     res.status(201).json({
//       success: true,
//       wedding
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// @desc    Get all my weddings
// @route   GET /api/weddings/all
// @access  Private (Couple only)
exports.getAllMyWeddings = async (req, res) => {
  try {
    console.log('🔍 getAllMyWeddings called for user:', req.user?.id);
    
    const weddings = await Wedding.find({ couple: req.user.id })
      .populate('couple', 'name email phone')
      .sort({ createdAt: -1 }); // Most recent first

    console.log('✅ Found weddings:', weddings.length);

    res.status(200).json({
      success: true,
      weddings
    });
  } catch (error) {
    console.error('❌ Error in getAllMyWeddings:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my wedding (backward compatibility - returns first wedding)
// @route   GET /api/weddings/my-wedding
// @access  Private (Couple only)
exports.getMyWedding = async (req, res) => {
  try {
    const wedding = await Wedding.findOne({ couple: req.user.id })
      .populate('couple', 'name email phone')
      .sort({ createdAt: -1 }); // Get most recent wedding

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'No wedding found'
      });
    }

    res.status(200).json({
      success: true,
      wedding
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get wedding by ID
// @route   GET /api/weddings/:id
// @access  Private
exports.getWeddingById = async (req, res) => {
  try {
    const wedding = await Wedding.findById(req.params.id).populate('couple', 'name email phone');

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'Wedding not found'
      });
    }

    // Check if user owns this wedding
    if (wedding.couple._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this wedding'
      });
    }

    res.status(200).json({
      success: true,
      wedding
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update wedding
// @route   PUT /api/weddings/:id
// @access  Private (Couple only)
exports.updateWedding = async (req, res) => {
  try {
    let wedding = await Wedding.findById(req.params.id);

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'Wedding not found'
      });
    }

    // Check ownership
    if (wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this wedding'
      });
    }

    // Auto-generate Google Maps link if coordinates provided
    if (req.body.venueLatitude && req.body.venueLongitude) {
      req.body.googleMapsLink = `https://www.google.com/maps?q=${req.body.venueLatitude},${req.body.venueLongitude}`;
    }

    // Auto-generate hashtag if names or date changed
    if (req.body.brideName || req.body.groomName || req.body.weddingDate) {
      const brideName = req.body.brideName || wedding.brideName;
      const groomName = req.body.groomName || wedding.groomName;
      const weddingDate = req.body.weddingDate || wedding.weddingDate;
      const year = new Date(weddingDate).getFullYear();
      const bride = brideName.split(' ')[0];
      const groom = groomName.split(' ')[0];
      req.body.hashtag = `#${groom}Weds${bride}${year}`;
    }

    wedding = await Wedding.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      wedding
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete wedding
// @route   DELETE /api/weddings/:id
// @access  Private (Couple only)
exports.deleteWedding = async (req, res) => {
  try {
    const wedding = await Wedding.findById(req.params.id);

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'Wedding not found'
      });
    }

    // Check ownership
    if (wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this wedding'
      });
    }

    await wedding.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Wedding deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
