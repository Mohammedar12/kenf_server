const Joi = require('joi');
const { roles } = require('../config/roles');
const { objectId } = require('./custom.validation');
const joiPhoneNumber = require('joi-phone-number');

const JoiExtended = Joi.extend(joiPhoneNumber);

const shopId = {
  params: JoiExtended.object().keys({
    id: JoiExtended.string().custom(objectId).required()
  }),
};

const createShop = {
  body: JoiExtended.object().keys({
    seller: JoiExtended.string().custom(objectId).required(),
    app_name_en: JoiExtended.string().trim().min(2).max(255).required(),
    app_name_ar: JoiExtended.string().trim().min(2).max(255).required(),
    app_abbreviation: JoiExtended.string().trim().required().min(1).max(255).required(),
    email: JoiExtended.string().trim().lowercase().email().required(),
    phone: JoiExtended.string().phoneNumber({ defaultCountry: 'SA', format: 'e164', strict: true}).required(),
    city: JoiExtended.string().trim().min(3).max(100).required(),
    region: JoiExtended.string().trim().min(3).max(255).required(),
    zip: JoiExtended.string().min(2).trim().max(15).required(),
    address_en: JoiExtended.string().trim().min(3).max(500).required(),
    address_ar: JoiExtended.string().trim().min(3).max(500).required(),
    description_en: JoiExtended.string().trim().min(3).max(500).required(),
    description_ar: JoiExtended.string().trim().min(3).max(500).required(),
    commission: JoiExtended.number().min(0).required(),
    active: JoiExtended.boolean(),
    images: Joi.array().items(Joi.string().custom(objectId)).min(1).max(10).required()
  }),
};

const updateShop = {
  params: JoiExtended.object().keys({
    id: JoiExtended.string().custom(objectId).required()
  }),
  body: JoiExtended.object().keys({
    seller: JoiExtended.string().custom(objectId),
    app_name_en: JoiExtended.string().trim().min(2).max(255),
    app_name_ar: JoiExtended.string().trim().min(2).max(255),
    app_abbreviation: JoiExtended.string().trim().min(1).max(255),
    email: JoiExtended.string().trim().lowercase().email(),
    phone: JoiExtended.string().phoneNumber({ defaultCountry: 'SA', format: 'e164', strict: true}),
    city: JoiExtended.string().trim().min(3).max(100),
    region: JoiExtended.string().trim().min(3).max(255),
    zip: JoiExtended.string().trim().min(2).max(15),
    address_en: JoiExtended.string().trim().min(3).max(500),
    address_ar: JoiExtended.string().trim().min(3).max(500),
    description_en: JoiExtended.string().trim().min(3).max(500),
    description_ar: JoiExtended.string().trim().min(3).max(500),
    commission: JoiExtended.number().min(0),
    images: Joi.array().items(Joi.string().custom(objectId)).min(1).max(10),
    active: JoiExtended.boolean(),
  }),
};


const getShopList = {
  query: JoiExtended.object().keys({
    limit: JoiExtended.number().integer().min(5).max(500),
    page: JoiExtended.number().integer().min(1),
    sort: JoiExtended.string().valid('createdAt','-createdAt','name','-name','email','-email','phone','-phone','city','-city','zip','-zip'),
  }),
};

module.exports = {
  shopId,
  createShop,
  updateShop,
  getShopList
};