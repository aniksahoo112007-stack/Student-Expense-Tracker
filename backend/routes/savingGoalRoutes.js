const express = require('express');
const { getGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/savingGoalController');
const { protect } = require('../middleware/authMiddleware');
const { validateGoal } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getGoals);
router.post('/', validateGoal, createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
