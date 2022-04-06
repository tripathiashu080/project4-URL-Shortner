const express = require('express')
const validUrl = require('valid-url')
const shortid = require('shortid')
const router = express.Router()
const urlController = require('../controller/urlController');

router.post('/url/shorten', urlController.createUrl);
router.get('/:urlCode', urlController.getCode);

module.exports = router