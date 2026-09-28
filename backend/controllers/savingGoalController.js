const SavingGoalModel = require('../models/savingGoalModel');

// GET /api/goals
const getGoals = async (req, res, next) => {
  try {
    const goals = await SavingGoalModel.findAll(req.user.id);
    res.json({ success: true, data: { goals } });
  } catch (error) {
    next(error);
  }
};

// POST /api/goals
const createGoal = async (req, res, next) => {
  try {
    const { title, target_amount, saved_amount, target_date } = req.body;

    const goal = await SavingGoalModel.create({
      user_id: req.user.id,
      title: title.trim(),
      target_amount: Number(target_amount),
      saved_amount: Number(saved_amount) || 0,
      target_date: target_date || null,
    });

    res.status(201).json({ success: true, data: { goal } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/goals/:id
const updateGoal = async (req, res, next) => {
  try {
    const existing = await SavingGoalModel.findById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.target_amount !== undefined) updates.target_amount = Number(req.body.target_amount);
    if (req.body.saved_amount !== undefined) updates.saved_amount = Number(req.body.saved_amount);
    if (req.body.target_date !== undefined) updates.target_date = req.body.target_date;

    const goal = await SavingGoalModel.update(req.params.id, req.user.id, updates);

    res.json({ success: true, data: { goal } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/goals/:id
const deleteGoal = async (req, res, next) => {
  try {
    const existing = await SavingGoalModel.findById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    await SavingGoalModel.delete(req.params.id, req.user.id);

    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
