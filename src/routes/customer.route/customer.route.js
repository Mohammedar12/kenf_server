const express = require('express');
const customerController = require('../../controllers/customer.controller/customer.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const customerValidation = require('../../validations/customer.validation');

const router = express.Router();

router.route('/')
  .get(auth('admin'), validate(customerValidation.getCustomerList), customerController.getCustomerList)
  .post(auth('admin'), validate(customerValidation.createCustomer), customerController.createCustomer)

router.route('/:id')
  .put(auth('admin'), validate(customerValidation.updateCustomer), customerController.updateCustomer)
  .delete(auth('admin'), validate(customerValidation.customerId), customerController.deleteCustomer)

module.exports = router;