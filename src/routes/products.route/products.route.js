const express = require('express');
const productController = require('../../controllers/products.controller/products.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const productValidation = require('../../validations/product.validation');

const router = express.Router();

router.route('/').get(validate(productValidation.getProductListApp),productController.getProductListApp);
router.route('/find').get(auth('admin',true),validate(productValidation.findProducts),productController.findProducts);
router.route('/admin').get(auth('admin'),validate(productValidation.getProductListAdmin),productController.getProductListAdmin);

router.route('/admin/single').get(auth('admin'), validate(productValidation.getAdminProduct), productController.getProductAdmin)

router.route('/').post(auth('admin'),validate(productValidation.createProduct), productController.createProduct);

//router.route('/available/:id').get(validate(productValidation.productId), productController.productIsAvailable);

router.route('/:id')
    .get(auth('admin',true), validate(productValidation.productId), productController.getProductApp)
    .delete(auth('admin'), validate(productValidation.productId), productController.deleteProduct)
    .put(auth('admin'), validate(productValidation.updateProduct), productController.updateProduct);

module.exports = router;