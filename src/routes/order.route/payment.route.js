const express = require('express');
const paymentController = require('../../controllers/order.controller/payment.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const paymentValidation = require('../../validations/payment.validation');

const router = express.Router();

router.route('/initiate').get(auth(),paymentController.initiatePaymentSession);
router.route('/execute').post(auth(),validate(paymentValidation.executePayment),paymentController.executePayment);
router.route('/webhook').post(validate(paymentValidation.paymentWebhook),paymentController.paymentWebhook);
router.route('/status').get(auth(),validate(paymentValidation.getPaymentStatus),paymentController.getPaymentStatus);

module.exports = router;