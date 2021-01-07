const express = require('express');
const router = express.Router();
const users_controllers = require('../controllers/users.js');

router.get('/', (req, res) => {
    res.send('Users root location');
});

router.post('/', users_controllers.createUser);
router.get('/:user_name', users_controllers.getUser);

module.exports = router;