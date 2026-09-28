const express = require('express');
const { getExpenses, getExpense, createExpense, updateExpense, deleteExpense, getExpensesByDate } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { validateExpense } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getExpenses);
router.get('/date/:date', getExpensesByDate);
router.get('/:id', getExpense);
router.post('/', validateExpense, createExpense);
router.put('/:id', validateExpense, updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
