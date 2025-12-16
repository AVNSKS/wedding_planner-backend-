const Budget = require('../models/Budget');
const Wedding = require('../models/Wedding');
const { getUserWedding } = require('../utils/weddingHelpers');

// @desc    Add budget category
// @route   POST /api/budgets
// @access  Private (Couple only)
exports.addBudget = async (req, res) => {
  try {
    const { category, estimatedCost, actualCost, notes, weddingId } = req.body;

    // Get couple's wedding
    const wedding = await getUserWedding(req.user.id, weddingId);

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'Please create a wedding first'
      });
    }

    // Check if budget for this category already exists
    const existingBudget = await Budget.findOne({
      wedding: wedding._id,
      category
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: `Budget for ${category} already exists. Use update instead.`
      });
    }

    const budget = await Budget.create({
      wedding: wedding._id,
      category,
      estimatedCost,
      actualCost: actualCost || 0,
      notes
    });

    res.status(201).json({
      success: true,
      budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all budgets for my wedding
// @route   GET /api/budgets?weddingId=xxx
// @access  Private (Couple only)
exports.getMyBudgets = async (req, res) => {
  try {
    const { weddingId } = req.query;
    const wedding = await getUserWedding(req.user.id, weddingId);

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'No wedding found'
      });
    }

    const budgets = await Budget.find({ wedding: wedding._id });

    // Calculate totals
    const totalEstimated = budgets.reduce((sum, b) => sum + b.estimatedCost, 0);
    const totalActual = budgets.reduce((sum, b) => sum + b.actualCost, 0);
    const remaining = totalEstimated - totalActual;

    // Find over-budget categories
    const alerts = budgets
      .filter(b => b.actualCost > b.estimatedCost)
      .map(b => ({
        category: b.category,
        estimatedCost: b.estimatedCost,
        actualCost: b.actualCost,
        overBy: b.actualCost - b.estimatedCost,
        percentageOver: b.variancePercentage.toFixed(2)
      }));

    res.status(200).json({
      success: true,
      count: budgets.length,
      summary: {
        totalEstimated,
        totalActual,
        remaining,
        percentageUsed: ((totalActual / totalEstimated) * 100).toFixed(2)
      },
      alerts,
      budgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get budget by ID
// @route   GET /api/budgets/:id
// @access  Private (Couple only)
exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id).populate('wedding');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check ownership
    if (budget.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private (Couple only)
exports.updateBudget = async (req, res) => {
  try {
    let budget = await Budget.findById(req.params.id).populate('wedding');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check ownership
    if (budget.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      budget,
      variancePercentage: budget.variancePercentage.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private (Couple only)
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id).populate('wedding');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    if (budget.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get budget alerts
// @route   GET /api/budgets/alerts
// @access  Private (Couple only)
exports.getBudgetAlerts = async (req, res) => {
  try {
    const wedding = await Wedding.findOne({ couple: req.user.id });

    if (!wedding) {
      return res.status(404).json({
        success: false,
        message: 'No wedding found'
      });
    }

    const budgets = await Budget.find({ wedding: wedding._id });

    // Get over-budget categories
    const overBudget = budgets.filter(b => b.actualCost > b.estimatedCost);

    // Get near-budget categories (90%+)
    const nearBudget = budgets.filter(
      b => b.actualCost <= b.estimatedCost && (b.actualCost / b.estimatedCost) >= 0.9
    );

    res.status(200).json({
      success: true,
      alerts: {
        overBudget: overBudget.map(b => ({
          category: b.category,
          estimatedCost: b.estimatedCost,
          actualCost: b.actualCost,
          overBy: b.actualCost - b.estimatedCost,
          percentageOver: b.variancePercentage.toFixed(2)
        })),
        nearBudget: nearBudget.map(b => ({
          category: b.category,
          estimatedCost: b.estimatedCost,
          actualCost: b.actualCost,
          remaining: b.estimatedCost - b.actualCost,
          percentageUsed: ((b.actualCost / b.estimatedCost) * 100).toFixed(2)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
