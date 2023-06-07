const express = require('express');
const shopController = require('../../controllers/shop.controller/shop.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const shopValidation = require('../../validations/shop.validation');

const router = express.Router();

router.route('/')
    .get(auth('admin'),validate(shopValidation.getShopList), shopController.getShopList)
    .post(auth('admin'),validate(shopValidation.createShop), shopController.createShop);

router.route('/:id')
    .get(auth('admin'), validate(shopValidation.shopId), shopController.getShopById)
    .delete(auth('admin'), validate(shopValidation.shopId), shopController.deleteShop)
    .put(auth('admin'), validate(shopValidation.updateShop), shopController.updateShop);

module.exports = router;
