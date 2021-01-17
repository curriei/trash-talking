const router = require('express').Router();
const auth = require('../controllers/auth.js');
const garbageControllers = require('../controllers/garbage.js');
const binControllers = require('../controllers/bins.js');

router.get('/', auth.verifyToken, garbageControllers.garbageQuery);
router.get('/current', auth.verifyToken,binControllers.current);

module.exports = router;