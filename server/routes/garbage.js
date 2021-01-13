const router = require('express').Router();
const auth = require('../controllers/auth.js');
const garbageControllers = require('../controllers/garbage.js');

router.get('/', auth.verifyToken, garbageControllers.garbageQuery);
router.get('/current', auth.verifyToken, garbageControllers.current);

module.exports = router;