const express = require('express');
const router = express.Router();

router.get('/', (res, req) => {
    res.send('Bins root location')
});

module.exports = router;