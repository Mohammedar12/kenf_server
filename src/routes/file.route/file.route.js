const express = require('express');
const fileController = require('../../controllers/file.controller/file.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.route('/public/image').post(auth('admin'), fileController.uploadPublicImage);

module.exports = router;
