const express = require('express');
const { getSummary, getCategoryBreakdown, getMonthlyTrend, getWeeklySpending, getNeedsVsWants, getCalendarData, getMonthlyReport } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/monthly-trend', getMonthlyTrend);
router.get('/weekly-spending', getWeeklySpending);
router.get('/needs-vs-wants', getNeedsVsWants);
router.get('/calendar/:year/:month', getCalendarData);
router.get('/monthly-report', getMonthlyReport);

module.exports = router;
