const express = require('express');
const router = express.Router();
const usersControllers = require('../controllers/users.js');
const auth = require('../controllers/auth.js');

//Users Routes
router.post('/new', auth.createUser);
router.post('/login', auth.loginUser);
router.get('/test', auth.verifyToken, (req, res) => {
    console.log(req.uid);
    res.send('Private request');
});
router.get('/:user_name', usersControllers.getUser);

module.exports = router;