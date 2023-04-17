const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const { roles } = require('../config/roles');

const productId = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  })
}

const getAdminProduct = {
  query: Joi.object().keys({
    id: Joi.string().custom(objectId),
    barcode: Joi.string().trim(),
  })
}

const createProduct = {
  body: Joi.object().keys({
    name_ar: Joi.string().trim().min(2).max(255).required(),
    name_en: Joi.string().trim().min(2).max(255).required(),
    category: Joi.string().custom(objectId).required(),
    kenf_collection: Joi.string().custom(objectId).required(),
    purity: Joi.array().items(Joi.string().custom(objectId)).min(1).required(),
    shop: Joi.string().custom(objectId).required(),
    weight: Joi.number().min(0).required(),
    quantity: Joi.number().min(0).required(),
    extra_price: Joi.number().min(0).required(),
    group: Joi.string().custom(objectId).required(),
    unit: Joi.array().items(Joi.string().custom(objectId)).min(1).required(),
    commission: Joi.number().min(0).required(),
    description_ar: Joi.string().trim().min(3).max(700).required(),
    description_en: Joi.string().trim().min(3).max(700).required(),
    meta: Joi.object({
        title: Joi.string().trim().min(1).max(255),
        keywords: Joi.array().items(Joi.string().trim().min(1).max(255)),
        description: Joi.string().trim().min(1).max(255),
      }),
    color: Joi.string().required().valid('Yellow', 'White', 'Multi'),
    barcode: Joi.string().trim().min(1).max(255),
    hidden: Joi.boolean(),
    ringSize: Joi.string().custom(objectId),
    isExclusive: Joi.boolean(),
    active: Joi.boolean(),
    images: Joi.array().required().items(Joi.string().custom(objectId)).min(1).max(10),
    mainImage: Joi.string().custom(objectId),
    isSpecial: Joi.boolean(),
    special_cat_id: Joi.string().custom(objectId),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    name_ar: Joi.string().trim().min(2).max(255),
    name_en: Joi.string().trim().min(2).max(255),
    category: Joi.string().custom(objectId),
    kenf_collection: Joi.string().custom(objectId),
    purity: Joi.array().items(Joi.string().custom(objectId)).min(1),
    shop: Joi.string().custom(objectId),
    weight: Joi.number().min(0),
    quantity: Joi.number().min(0),
    extra_price: Joi.number().min(0),
    group: Joi.string().custom(objectId),
    unit: Joi.array().items(Joi.string().custom(objectId)).min(1),
    commission: Joi.number().min(0),
    description_ar: Joi.string().trim().min(3).max(700),
    description_en: Joi.string().trim().min(3).max(700),
    meta: Joi.object({
        title: Joi.string().trim().min(1).max(255),
        keywords: Joi.array().items(Joi.string().trim().min(1).max(255)),
        description: Joi.string().trim().min(1).max(255),
      }),
    color: Joi.string().valid('Yellow', 'White', 'Multi'),
    barcode: Joi.string().trim().min(1).max(255),
    hidden: Joi.boolean(),
    ringSize: Joi.string().custom(objectId),
    isExclusive: Joi.boolean(),
    active: Joi.boolean(),
    images: Joi.array().items(Joi.string().custom(objectId)).min(1).max(10),
    mainImage: Joi.string().custom(objectId),
    isSpecial: Joi.boolean(),
    special_cat_id: Joi.alternatives().conditional('isSpecial', { is: true, then: Joi.string().custom(objectId), otherwise: Joi.forbidden() }),
  }),
};

const getProductListAdmin = {
  query: Joi.object().keys({
    category: Joi.array().items(Joi.string().custom(objectId)),
    groups: Joi.array().items(Joi.string().custom(objectId)),
    shops: Joi.array().items(Joi.string().custom(objectId)),
    search: Joi.string().trim().min(3).max(255),
    hidden: Joi.boolean(),
    active: Joi.boolean(),
    isExclusive: Joi.boolean(),
    limit: Joi.number().integer().min(5).max(500),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid('createdAt','-createdAt','-name_ar', 'name_ar', 'name_en', '-name_en', 'weight', 'quantity', 'extra_price', '-weight', '-quantity', '-extra_price'),
  }),
}

const getProductListApp = {
  query: Joi.object().keys({
    isExclusive: Joi.boolean(),
    group: Joi.array().items(Joi.string().custom(objectId)),
    color: Joi.array().items(Joi.string().valid('Yellow','White','Multi')),
    kenf_collection: Joi.string().custom(objectId),
    purity: Joi.array().items(Joi.string().custom(objectId)),
    category: Joi.string().custom(objectId),
    limit: Joi.number().integer().min(5).max(50),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid('createdAt','-createdAt','extra_price','-extra_price','visited','-visited'),
  }),
}

const findProducts = {
  query: Joi.object().keys({
    products: Joi.array().items(Joi.string().custom(objectId)).max(20).required()
  }),
}

module.exports = {
  productId,
  createProduct,
  updateProduct,
  getProductListAdmin,
  getAdminProduct,
  getProductListApp,
  findProducts
};