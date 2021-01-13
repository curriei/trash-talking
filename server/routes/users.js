const express = require('express');
const router = express.Router();
const usersControllers = require('../controllers/users.js');
const auth = require('../controllers/auth.js');

//Users Routes
router.post('/new', auth.createUser);
router.post('/login', auth.loginUser);
router.get('/goals', auth.verifyToken, usersControllers.getGoals);
router.get('/profile/:user_name', auth.verifyToken, usersControllers.getUser);

module.exports = router;