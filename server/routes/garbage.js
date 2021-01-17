const router = require('express').Router();
const auth = require('../controllers/auth.js');
const garbageControllers = require('../controllers/garbage.js');

router.get('/', auth.verifyToken, garbageControllers.garbageQuery);

module.exports = router;