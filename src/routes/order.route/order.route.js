const express = require('express');
const orderController = require('../../controllers/order.controller/order.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const orderValidation = require('../../validations/order.validation');

const router = express.Router();

router.route('/').get(auth(),validate(orderValidation.ordersList),orderController.ordersList);

router.route('/').put(auth('admin'),validate(orderValidation.updateOrder),orderController.updateOrder);

router.route('/invoice').get(auth(),validate(orderValidation.invoicesList),orderController.invoicesList);

router.route('/invoice/:id').get(auth(),validate(orderValidation.orderId),orderController.getInvoice);

router.route('/:id').get(auth(),validate(orderValidation.orderId),orderController.getOrder);

router.route('/:id').delete(auth('admin'),validate(orderValidation.orderId),orderController.deleteOrder);

module.exports = router;