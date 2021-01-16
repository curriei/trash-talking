const express = require('express');
const router = express.Router();
const usersControllers = require('../controllers/users.js');
const auth = require('../controllers/auth.js');

//Users Routes
router.post('/new', auth.createUser); //check
router.post('/login', auth.loginUser); // passs
router.get('/goals', auth.verifyToken, usersControllers.getGoals);
router.post('/goals/new', auth.verifyToken, usersControllers.newGoal);
router.get('/profile', auth.verifyToken, usersControllers.getUser); //pass
router.get('/bins', auth.verifyToken, usersControllers.getBins); //pass

module.exports = router;