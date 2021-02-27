const express = require('express');
const router = express.Router();
const goalsControllers = require('../controllers/goals.js');
const auth = require('../controllers/auth.js');


router.get('/', auth.verifyToken, goalsControllers.getGoals);
router.post('/new', auth.verifyToken, goalsControllers.newGoal);
router.get('/insights', auth.verifyToken, goalsControllers.getInsights);
router.post('/insights/new', auth.verifyAdmin, goalsControllers.newInsight);

module.exports = router;