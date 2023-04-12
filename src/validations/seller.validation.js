const Joi = require('joi');
const { roles } = require('../config/roles');
const { objectId } = require('./custom.validation');
const joiPhoneNumber = require('joi-phone-number');

const JoiExtended = Joi.extend(joiPhoneNumber);

const sellerId = {
  params: JoiExtended.object().keys({
    id: JoiExtended.string().required().custom(objectId)
  }),
};

const createSeller = {
  body: JoiExtended.object().keys({
    name_en: JoiExtended.string().trim().min(3).max(255).required(),
    name_ar:JoiExtended.string().trim().min(3).max(255).required(),
    address_en: JoiExtended.string().trim().min(3).max(500).required(),
    address_ar: JoiExtended.string().trim().min(3).max(500).required(),
    description_en: JoiExtended.string().trim().min(3).max(500).required(),
    description_ar: JoiExtended.string().trim().min(3).max(500).required(),
    city: JoiExtended.string().trim().min(3).max(100).required(),
    region: JoiExtended.string().trim().min(3).max(255).required(),
    zip: JoiExtended.string().trim().min(2).max(15).required(),
    email: JoiExtended.string().trim().lowercase().email().required(),
    phone: JoiExtended.string().phoneNumber({ defaultCountry: 'SA', format: 'e164', strict: true}).required(),
    active: JoiExtended.boolean(),
  }),
};

const updateSeller = {
  params: JoiExtended.object().keys({
    id: JoiExtended.string().required().custom(objectId)
  }),
  body: JoiExtended.object().keys({
    name_en: JoiExtended.string().trim().min(3).max(255),
    name_ar:JoiExtended.string().trim().min(3).max(255),
    address_en: JoiExtended.string().trim().min(3).max(500),
    address_ar: JoiExtended.string().trim().min(3).max(500),
    description_en: JoiExtended.string().trim().min(3).max(500),
    description_ar: JoiExtended.string().trim().min(3).max(500),
    city: JoiExtended.string().trim().min(3).max(100),
    region: JoiExtended.string().trim().min(3).max(255),
    zip: JoiExtended.string().trim().min(2).max(15),
    email: JoiExtended.string().trim().lowercase().email(),
    phone: JoiExtended.string().phoneNumber({ defaultCountry: 'SA', format: 'e164', strict: true}),
    deleteDocuments: JoiExtended.array().items(Joi.string()),
    active: JoiExtended.boolean(),
  }),
};


const getSellerList = {
  query: JoiExtended.object().keys({
    limit: JoiExtended.number().integer().min(5).max(500),
    page: JoiExtended.number().integer().min(1),
    sort: JoiExtended.string().valid('createdAt','-createdAt','name','-name','email','-email','phone','-phone','city','-city','zip','-zip'),
  }),
};

module.exports = {
  sellerId,
  createSeller,
  updateSeller,
  getSellerList,
};