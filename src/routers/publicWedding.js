const express = require('express');
const { getWeddingInfoByToken } = require('../controllers/publicWeddingController');

const router = express.Router();

router.get('/wedding/:token', getWeddingInfoByToken);

module.exports = router;
