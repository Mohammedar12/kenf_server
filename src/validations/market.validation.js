const Joi = require('joi');
const { roles } = require('../config/roles');
const { objectId } = require('./custom.validation');

/********************  Coupon  *************************** */
const couponId = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required()
  }),
};

const applyCouponCode = {
  query: Joi.object().keys({
    code: Joi.string().required()
  }),
};

const createCoupon = {
  body: Joi.object().keys({
    user: Joi.string().trim().min(2).max(255).allow(null, ''),
    email: Joi.string().trim().lowercase().email().allow(null, ''),
    code: Joi.string().trim().min(2).max(255).alphanum().uppercase().required(),
    discount_type: Joi.string().valid('percent', 'fixed').required(),
    discount: Joi.alternatives().conditional('discount_type',{ is: 'percent', then: Joi.number().min(0).max(100).required(), otherwise: Joi.number().min(0).required() }),
    max_discount: Joi.alternatives().conditional('discount_type', { is: 'percent', then: Joi.number().min(0).required(),otherwise: Joi.forbidden() }),
    profit_type:  Joi.string().valid('percent', 'fixed').required(),
    profit: Joi.alternatives().conditional('profit_type', { is: 'percent', then: Joi.number().min(0).max(100).required(), otherwise: Joi.number().min(0).required() }),
    total_purchase_condition: Joi.number().min(0),
    included_category: Joi.string().custom(objectId),
    except_discounted_product: Joi.boolean(),
    start_date: Joi.date().iso(),
    end_date: Joi.date().when('start_date',{ is: Joi.exist(), then: Joi.date().greater(Joi.ref('start_date')) }),
    freeShipping: Joi.array().items(Joi.string().custom(objectId)),
    active: Joi.boolean(),
  }),
};

const updateCoupon = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required()
  }),
  body: Joi.object().keys({
    user: Joi.string().trim().min(2).max(255).allow(null, ''),
    email: Joi.string().trim().lowercase().email().allow(null, ''),
    code: Joi.string().trim().min(2).max(255).alphanum().uppercase(),
    discount_type: Joi.string().valid('percent', 'fixed').when('discount',{ is: Joi.exist(), then: Joi.required() }),
    discount: Joi.alternatives().conditional('discount_type',{ is: 'percent', then: Joi.number().min(0).max(100), otherwise: Joi.number().min(0) }),
    max_discount: Joi.alternatives().conditional('discount_type', { is: 'percent', then: Joi.number().min(0),otherwise: Joi.forbidden() }),
    profit_type:  Joi.string().valid('percent', 'fixed'),
    profit: Joi.alternatives().conditional('profit_type', { is: 'percent', then: Joi.number().min(0).max(100), otherwise: Joi.number().min(0) }),
    total_purchase_condition: Joi.number().min(0),
    included_category: Joi.string().custom(objectId),
    except_discounted_product: Joi.boolean(),
    start_date: Joi.date().iso(),
    end_date: Joi.date().when('start_date',{ is: Joi.exist(), then: Joi.date().greater(Joi.ref('start_date')) }),
    freeShipping: Joi.array().items(Joi.string().custom(objectId)),
    active: Joi.boolean(),
  }),
};

const getCouponList = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(5).max(500),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid('createdAt','-createdAt','name','-name','email','-email','phone','-phone','city','-city','zip','-zip'),
  }),
};
/******************************************************* */

/********************  Marketing Category  *************************** */
const marketingCategoryId = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required()
  }),
};

const createMarketingCategory = {
  body: Joi.object().keys({
    name_ar: Joi.string().trim().min(1).max(255).required(),
    name_en: Joi.string().trim().min(1).max(255).required(),
  }),
};

const updateMarketingCategory = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required()
  }),
  body: Joi.object().keys({
    name_ar: Joi.string().trim().min(1).max(255),
    name_en: Joi.string().trim().min(1).max(255),
  }),
};

const getMarketingCategoryList = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(5).max(500),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid('createdAt','-createdAt','name','-name','email','-email','phone','-phone','city','-city','zip','-zip'),
  }),
};
/******************************************************* */

/********************  Offer  *************************** */
const offerId = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required()
  }),
};

const createOffer = {
  body: Joi.object().keys({
    name_ar: Joi.string().trim().min(1).max(255).required(),
    name_en: Joi.string().trim().min(1).max(255).required(),
    description_ar: Joi.string().trim().min(1).max(500).required(),
    description_en: Joi.string().trim().min(1).max(500).required(),
    discount: Joi.number().min(0).required(),
    start_date: Joi.date().iso(),
    end_date: Joi.date().when('start_date',{ is: Joi.exist(), then: Joi.date().greater(Joi.ref('start_date')) }),
    active: Joi.boolean(),
  }),
};

const updateOffer = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required()
  }),
  body: Joi.object().keys({
    name_ar: Joi.string().trim().min(1).max(255),
    name_en: Joi.string().trim().min(1).max(255),
    description_ar: Joi.string().trim().min(1).max(500),
    description_en: Joi.string().trim().min(1).max(500),
    discount: Joi.number().min(0),
    start_date: Joi.date().iso(),
    end_date: Joi.date().when('start_date',{ is: Joi.exist(), then: Joi.date().greater(Joi.ref('start_date')) }),
    active: Joi.boolean(),
  }),
};

const getOfferList = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(5).max(500),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid('createdAt','-createdAt','name','-name','email','-email','phone','-phone','city','-city','zip','-zip'),
  }),
};
/******************************************************* */

module.exports = {
  couponId,
  createCoupon,
  updateCoupon,
  getCouponList,
  marketingCategoryId,
  createMarketingCategory,
  updateMarketingCategory,
  getMarketingCategoryList,
  offerId,
  createOffer,
  updateOffer,
  getOfferList,
  applyCouponCode
};