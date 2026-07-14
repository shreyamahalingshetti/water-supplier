const express = require('express');
const router = express.Router();
const { sendSuccess } = require('../utils/response');

router.get('/', (req, res) => {
  return sendSuccess(res, 'Auth API route working');
});

module.exports = router;
