const express = require('express');
const { getBudgets, createBudget, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const { validateBudget } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getBudgets);
router.post('/', validateBudget, createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
