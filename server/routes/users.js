const express = require('express');
const router = express.Router();
const usersControllers = require('../controllers/users.js');
const auth = require('../controllers/auth.js');

//Users Routes
router.post('/new', auth.createUser);
router.post('/login', auth.loginUser);
router.post('/delete', auth.verifyToken, auth.deleteUser);
router.get('/profile', auth.verifyToken, usersControllers.getUser);
router.get('/bins', auth.verifyToken, usersControllers.getBins);
router.get('/search', auth.verifyToken, usersControllers.searchUsers);
router.post('/friends/request', auth.verifyToken, usersControllers.requestFriend);
router.post('/friends/accept', auth.verifyToken, usersControllers.acceptRequest);
router.post('/friends/deny', auth.verifyToken, usersControllers.denyRequest);
router.get('/friends', auth.verifyToken, usersControllers.getFriends);
router.get('/friends/requests', auth.verifyToken, usersControllers.getFriendRequests);
router.post('/share', auth.verifyToken, usersControllers.shareQuery);
router.get('/shares', auth.verifyToken, usersControllers.getSharedQueries);

module.exports = router;
