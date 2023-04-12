const express = require('express');
const sellerController = require('../../controllers/seller.controller/seller.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const sellerValidation = require('../../validations/seller.validation');

const router = express.Router();

router.route('/')
    .get(auth('admin'),validate(sellerValidation.getSellerList), sellerController.getSellerList)
    .post(auth('admin'),validate(sellerValidation.createSeller), sellerController.createSeller);

router.route('/:id')
    .get(auth('admin'), validate(sellerValidation.sellerId), sellerController.getSellerById)
    .delete(auth('admin'), validate(sellerValidation.sellerId), sellerController.deleteSeller)
    .put(auth('admin'), validate(sellerValidation.updateSeller), sellerController.updateSeller);

module.exports = router;
