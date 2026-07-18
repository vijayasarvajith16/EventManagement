const express = require('express');
const { getMyRegistrations } = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

const router = express.Router();


router.get('/my', protect, getMyRegistrations);

module.exports = router;
