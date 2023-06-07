const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/user.controller/auth.controller');

const router = express.Router();

router.post('/email/sendOtp', validate(authValidation.signinSendMailOtp), authController.signinSendMailOtp);
router.post('/mobile/sendOtp', validate(authValidation.signinSendMobileOtp), authController.signinSendMobileOtp);
router.post('/signin/verifyOtp', validate(authValidation.signInWithOtp), authController.signInWithOtp);
router.post('/admin/signin', validate(authValidation.signInWithPasswordAdmin), authController.signInWithPasswordAdmin);
router.post('/logout', validate(authValidation.logout), authController.logout);

module.exports = router;