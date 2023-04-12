const express = require('express');
const marketController = require('../../controllers/market.controller/market.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const marketValidation = require('../../validations/market.validation');

const router = express.Router();

router.route('/coupon')
    .get(auth(), validate(marketValidation.getCouponList), marketController.getCouponList)
    .post(auth('admin'), validate(marketValidation.createCoupon), marketController.createCoupon);

router.route('/coupon/stats/:id').get(auth(), validate(marketValidation.couponId), marketController.getCouponStats);

router.route('/coupon/apply').get(auth,validate(marketValidation.applyCouponCode),marketController.applyCouponCode);

router.route('/coupon/:id')
    .delete(auth('admin'), validate(marketValidation.couponId), marketController.deleteCoupon)
    .put(auth('admin'), validate(marketValidation.updateCoupon), marketController.updateCoupon);

router.route('/offer')
    .get(auth('admin'), validate(marketValidation.offerId), marketController.getOfferList)
    .post(auth('admin'), validate(marketValidation.createOffer), marketController.createOffer);

router.route('/offer/:id')
    .delete(auth('admin'), validate(marketValidation.offerId), marketController.deleteOffer)
    .put(auth('admin'), validate(marketValidation.updateOffer), marketController.updateOffer);

router.route('/category')
    .get(auth('admin'), validate(marketValidation.marketingCategoryId), marketController.getMarketingCategoryList)
    .post(auth('admin'), validate(marketValidation.createMarketingCategory), marketController.createMarketingCategory);

router.route('/category/:id')
    .delete(auth('admin'), validate(marketValidation.marketingCategoryId), marketController.deleteMarketingCategory)
    .put(auth('admin'), validate(marketValidation.updateMarketingCategory), marketController.updateMarketingCategory);

module.exports = router;