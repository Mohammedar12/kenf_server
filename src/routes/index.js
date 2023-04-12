const express = require('express');
const settingsRoute = require('./settings.route/settings.route');
const userRoute = require('./user.route/user.route');
const authRoute = require('./user.route/auth.route');
const marketRoute = require('./market.route/market.route');
const sellerRoute = require('./seller.route/seller.route');
const productsRoute = require('./products.route/products.route');
const shopRoute = require('./shop.route/shop.route');
const customerRoute = require('./customer.route/customer.route');
const orderRoute = require('./order.route/order.route');
const paymentRoute = require('./order.route/payment.route');
const fileRoute = require('./file.route/file.route');

const router = express.Router();

router.use('/user',userRoute);
router.use('/auth',authRoute);
router.use('/settings',settingsRoute);
router.use('/market',marketRoute);
router.use('/seller',sellerRoute);
router.use('/product',productsRoute);
router.use('/shop',shopRoute);
router.use('/customer',customerRoute);
router.use('/order',orderRoute);
router.use('/payment',paymentRoute);
router.use('/file',fileRoute);



module.exports = router;
