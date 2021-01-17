const express = require('express');
const router = express.Router();
const bin_controllers = require('../controllers/bins.js');
const auth = require('../controllers/auth.js');


//Bin routes
router.post('/create_bin', auth.verifyAdmin, bin_controllers.createBin);
router.post('/register', auth.verifyToken, bin_controllers.registerBin);
router.post('/update', bin_controllers.binUpdate);
router.get('/current', auth.verifyToken, bin_controllers.current);

module.exports = router;