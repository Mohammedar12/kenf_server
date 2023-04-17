const MarketingCategory = require('../../models/marketing.model/marketing_category.model');
const Offer = require('../../models/marketing.model/offer.model');
const Coupon = require('../../models/marketing.model/coupon.model');
const Shipping = require('../../models/settings.model/shipping.model');
const Category = require('../../models/settings.model/items_category.model');
const Order = require('../../models/order.model/order.model');
const logger = require('../../config/logger');
const pick = require('../../helpers/pick');
const convertObjectId = require('../../helpers/convertObjectId');
const catchAsync = require('../../helpers/catchAsync');

/******************   Coupon    ********************** */
const createCoupon = catchAsync(async (req,res,next)=>{
  const body = pick(req.body,['user','email','code','discount_type','discount','max_discount','profit','profit_type','total_purchase_condition','included_category','except_discounted_product', 'start_date', 'end_date', 'freeShipping', 'active']);
  const couponCodeExists = await Coupon.exists({ code: body.code.toUpperCase() });
  if(couponCodeExists){
    return res.status(400).json({
      status: 400,
      message: 'Coupon code already exists',
    });
  }
  if(body.freeShipping && body.freeShipping.length > 0){
    body.freeShipping = body.freeShipping.map((val)=>convertObjectId(val));
    const shippingCount = await Shipping.countDocuments({ _id: { $in: body.freeShipping }});
    if(shippingCount != body.freeShipping.length){
      return res.status(400).json({
        status: 400,
        message: 'Invalid freeShipping id',
      });
    } 
  }
  if(body.included_category){
    const categoryExists = await Category.exists({ _id: convertObjectId(body.included_category) });
    if(!categoryExists){
      return res.status(400).json({
        status: 400,
        message: 'Invalid included_category',
      });
    }
  }
  const coupon = await Coupon.create(body);
  return res.status(200).json({
    status: 200,
    message: 'Coupon created successfully',
    data: coupon
  });
});

const updateCoupon = catchAsync(async (req,res,next)=>{
  const body = pick(req.body,['user','email','code','discount_type','discount','max_discount','profit','profit_type','total_purchase_condition','included_category','except_discounted_product', 'start_date', 'end_date', 'freeShipping', 'active']);
  const coupon_id = convertObjectId(req.params.id);
  if(body.code){
    const couponCodeExists = await Coupon.exists({ code: body.code.toUpperCase(), _id: { $ne: coupon_id } });
    if(couponCodeExists){
      return res.status(400).json({
        status: 400,
        message: 'Coupon code already exists',
      });
    }
  }
  if(body.freeShipping && body.freeShipping.length > 0){
    body.freeShipping = body.freeShipping.map((val)=>convertObjectId(val));
    const shippingCount = await Shipping.countDocuments({ _id: { $in: body.freeShipping }});
    if(shippingCount != body.freeShipping.length){
      return res.status(400).json({
        status: 400,
        message: 'Invalid freeShipping id',
      });
    } 
  }
  if(body.included_category){
    const categoryExists = await Category.exists({ _id: convertObjectId(body.included_category) });
    if(!categoryExists){
      return res.status(400).json({
        status: 400,
        message: 'Invalid included_category',
      });
    }
  }
  const update = await Coupon.updateOne({ _id: coupon_id },body);
  if(update.nModified == 0){
      return res.status(404).json({
          status: 404,
          message: 'Coupon not found',
      });
  }
  return res.status(200).json({
    status: 200,
    message: 'Coupon updated successfully',
  });
});

const getCouponList = catchAsync(async (req, res, next) => {
  const filter = {};
  const options = pick(req.query, ['sort', 'limit', 'page']);
  if(!options.sort || options.sort === ''){
      options.sort = "-createdAt";
  }
  if(req.user?.role !== 'admin'){
    filter.email = req.user.email;
  }
  //options.populate = ['unit', 'mainImage','images','group','shop','purity','category'];
  //options.select = "_id name_ar name_en active";
  const result = await Coupon.paginate(filter, options);

  if(req.user?.role !== 'admin'){
    if(!result || result.totalDocs === 0){
      return res.status(403).json({
        status: 403,
        message: 'Not affiliate user',
      });
    }
  }
  
  return res.status(200).json({
      status: 200,
      message: '',
      data: result
  });
});

const getCoupon = catchAsync(async (req, res, next) => {
  try{
    let query = pick(req.query, ['id', 'code']);
    if(query.id){
      query._id = convertObjectId(query.id);
      delete query.id;
    }
    let coupon = await Product.findOne(query);
    if(!coupon){
      return res.status(404).json({
        status: 404,
        message: 'Coupon not found.',
      });
    }
    return res.status(200).json({
      status: 200,
      message: '',
      data: coupon
    });
  }
  catch(e){
    return res.status(404).json({
      status: 404,
      message: 'Coupon not found.',
    });
  }
});

const deleteCoupon = catchAsync(async (req, res, next) => {
  const couponId = req.params.id;
  const coupon = await Coupon.findOne({ _id: convertObjectId(couponId) },'id');
  if(!coupon){
      return res.status(404).json({
          status: 404,
          message: 'Coupon not found',
      });
  }
  await coupon.remove();
  return res.status(200).json({
      status: 200,
      message: 'Coupon deleted successfully.',
  });
});

const applyCouponCode = catchAsync(async(req,res,next)=>{
  const couponCode = req.params.code;
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true, $or: [ { start_date: null }, { start_date: { $lte: new Date() } } ], $or: [ { end_date: null }, { end_date: { $gte: new Date() } } ] },'id code discount discount_type max_discount total_purchase_condition freeShipping');
  if(!coupon){
    return res.status(404).json({ 
      status: 404,
      message: 'Coupon not found' 
    });
  }
  return res.status(200).json({ 
    status: 200,
    message: '',
    data: coupon
  });
});

const getCouponStats = catchAsync(async (req, res, next) => {
  const coupon_id = convertObjectId(req.params.id);
  const coupon = await Coupon.findOne({ _id: coupon_id });
  if(!coupon){
    return res.status(404).json({ 
      status: 404,
      message: 'Coupon not found' 
    });
  }
  if(req.user.role !== 'admin'){
    if(!req.user.email || !coupon.email || coupon.email !== req.user.email){
      return res.status(403).json({
        status: 403,
        message: 'Forbidden'
      });
    }
  }
  let count = await Order.countDocuments({ coupon_id: coupon_id, paymentStatus: 'SUCCESSED' });
  let profit = 0;
  if(coupon.profit_type === 'fixed'){
    profit = count * count.profit;
  }
  let totalAmount = await Order.aggregate([
    { $match: { coupon_id: coupon_id, paymentStatus: 'SUCCESSED' } },
    { $group: { _id: null, amount: { $sum: "$effectivePrice" } } }
  ]);
  if(coupon.profit_type === 'percent'){
    if(totalAmount && totalAmount.length != 0){
      profit = (totalAmount[0].amount * coupon.profit) / 100;
    }
  }
  return res.status(200).json({ 
      status: 200,
      message: '',
      data: {
        count, profit, userName: coupon.user, sales: (totalAmount && totalAmount.length != 0) ? totalAmount[0].amount : 0 
      }
    });
});

/***************************************************** */

/******************   Offer    ********************** */
const createOffer = catchAsync(async (req,res,next)=>{
  const body = pick(req.body,['name_ar','name_en','description_ar','description_en','discount','start_date', 'end_date', 'active']);
  const offer = await Offer.create(body);
  return res.status(200).json({
    status: 200,
    message: 'Offer created successfully',
    data: offer
  });
});

const updateOffer = catchAsync(async (req,res,next)=>{
  const body = pick(req.body,['name_ar','name_en','description_ar','description_en','discount','start_date', 'end_date', 'active']);
  const offer_id = convertObjectId(req.params.id);
  const update = await Offer.updateOne({ _id: offer_id },body);
  if(update.nModified == 0){
      return res.status(404).json({
          status: 404,
          message: 'Offer not found',
      });
  }
  return res.status(200).json({
    status: 200,
    message: 'Offer updated successfully',
  });
});

const getOfferList = catchAsync(async (req, res, next) => {
  const filter = {};
  const options = pick(req.query, ['sort', 'limit', 'page']);
  if(!options.sort || options.sort === ''){
      options.sort = "-createdAt";
  }
  //options.populate = ['unit', 'mainImage','images','group','shop','purity','category'];
  //options.select = "_id name_ar name_en active";
  const result = await Offer.paginate(filter, options);
  return res.status(200).json({
      status: 200,
      message: '',
      data: result
  });
});

const deleteOffer = catchAsync(async (req, res, next) => {
  const offerId = req.params.id;
  const offer = await Offer.findOne({ _id: convertObjectId(offerId) },'id');
  if(!offer){
      return res.status(404).json({
          status: 404,
          message: 'Offer not found',
      });
  }
  await offer.remove();
  return res.status(200).json({
      status: 200,
      message: 'Offer deleted successfully.',
  });
});
/***************************************************** */

/******************   Marketing Category    ********************** */
const createMarketingCategory = catchAsync(async (req,res,next)=>{
  const body = pick(req.body,['name_ar','name_en', 'active']);
  const marketingCategory = await MarketingCategory.create(body);
  return res.status(200).json({
    status: 200,
    message: 'Marketing category created successfully',
    data: marketingCategory
  });
});

const updateMarketingCategory = catchAsync(async (req,res,next)=>{
  const body = pick(req.body,['name_ar', 'name_en', 'active']);
  const category_id = convertObjectId(req.params.id);
  const update = await MarketingCategory.updateOne({ _id: category_id },body);
  if(update.nModified == 0){
      return res.status(404).json({
          status: 404,
          message: 'Marketing category not found',
      });
  }
  return res.status(200).json({
    status: 200,
    message: 'Marketing category updated successfully',
  });
});

const getMarketingCategoryList = catchAsync(async (req, res, next) => {
  const filter = {};
  const options = pick(req.query, ['sort', 'limit', 'page']);
  if(!options.sort || options.sort === ''){
      options.sort = "-createdAt";
  }
  //options.populate = ['unit', 'mainImage','images','group','shop','purity','category'];
  //options.select = "_id name_ar name_en active";
  const result = await MarketingCategory.paginate(filter, options);
  return res.status(200).json({
      status: 200,
      message: '',
      data: result
  });
});

const deleteMarketingCategory = catchAsync(async (req, res, next) => {
  const categoryId = req.params.id;
  const category = await MarketingCategory.findOne({ _id: convertObjectId(categoryId) },'id');
  if(!category){
      return res.status(404).json({
          status: 404,
          message: 'Marketing category not found',
      });
  }
  await category.remove();
  return res.status(200).json({
      status: 200,
      message: 'Marketing category deleted successfully.',
  });
});
/***************************************************** */


module.exports = {
  createCoupon,
  updateCoupon,
  getCouponList,
  getCoupon,
  deleteCoupon,
  createOffer,
  updateOffer,
  getOfferList,
  deleteOffer,
  createMarketingCategory,
  updateMarketingCategory,
  getMarketingCategoryList,
  deleteMarketingCategory,
  getCouponStats,
  applyCouponCode,
}