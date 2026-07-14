const express = require('express');
const router = express.Router();
const { sendSuccess } = require('../utils/response');

router.get('/', (req, res) => {
  return sendSuccess(res, 'Recurring Orders API route working');
});

module.exports = router;
