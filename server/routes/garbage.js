const router = require('express').Router();
const auth = require('../controllers/auth.js');
const garbageControllers = require('../controllers/garbage.js');

//Garbage routes
router.get('/query', auth.verifyToken, garbageControllers.garbageQuery);
router.get('/entries', auth.verifyToken, garbageControllers.garbageEntries);
router.get('/query/shared', auth.verifyToken, garbageControllers.sharedQuery);

module.exports = router;
