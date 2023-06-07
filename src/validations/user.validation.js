const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const { roles } = require('../config/roles');
const joiPhoneNumber = require('joi-phone-number');

const JoiExtended = Joi.extend(joiPhoneNumber);

const userId = {
  params: JoiExtended.object().keys({
    id: JoiExtended.string().custom(objectId).required()
  }),
};

const favoriteDelete = {
  params: JoiExtended.object().keys({
    id: JoiExtended.string().custom(objectId).required()
  }),
};

const groupId = {
  params: JoiExtended.object().keys({
    id: JoiExtended.string().custom(objectId).required()
  }),
};

const createUser = {
  body: JoiExtended.object().keys({
    name: JoiExtended.string().trim().min(3).max(255).required(),
    email: JoiExtended.string().trim().lowercase().email().required(),
    phone: JoiExtended.string().phoneNumber({ defaultCountry: 'SA', format: 'e164', strict: true}).required(),
    password: JoiExtended.string().custom(password).required(),
    role: JoiExtended.string().valid(...roles).required(),
  }),
};

const updateUser = {
  params: JoiExtended.object().keys({
    id: JoiExtended.string().custom(objectId).required()
  }),
  body: JoiExtended.object().keys({
    name: JoiExtended.string().min(3).max(255),
    email: JoiExtended.string().email(),
    phone: JoiExtended.string().phoneNumber({ defaultCountry: 'SA', format: 'e164', strict: true}),
    password: JoiExtended.string().custom(password),
    role: JoiExtended.string().valid(...roles),
    status: JoiExtended.boolean(),
  }),
};

const updateProfile = {
  body: JoiExtended.object().keys({
    name: JoiExtended.string().trim().min(3).max(255),
    email: JoiExtended.string().trim().lowercase().email(),
    phone: JoiExtended.string().phoneNumber({ defaultCountry: 'SA', format: 'e164', strict: true}),
    address: Joi.object({
      fullname: JoiExtended.string().trim().min(3).max(255).required(),
      phone: JoiExtended.string().phoneNumber({ defaultCountry: 'SA', format: 'e164', strict: true}).required(),
      email: JoiExtended.string().trim().lowercase().email().required(),
      country: JoiExtended.string().trim().min(2).max(100).required(),
      city: JoiExtended.string().trim().min(3).max(100).required(),
      zipCode: JoiExtended.string().trim().min(2).max(15).required(),
      street: JoiExtended.string().trim().min(3).max(500).required(),
    }),
    billingAddress: Joi.object({
      fullname: JoiExtended.string().trim().min(3).max(255).required(),
      phone: JoiExtended.string().phoneNumber({ defaultCountry: 'SA', format: 'e164', strict: true}).required(),
      email: JoiExtended.string().trim().lowercase().email().required(),
      country: JoiExtended.string().trim().min(2).max(100).required(),
      city: JoiExtended.string().trim().min(3).max(100).required(),
      zipCode: JoiExtended.string().trim().min(2).max(15).required(),
      street: JoiExtended.string().trim().min(3).max(500).required(),
    }),
  }),
}

const getUserList = {
  query: JoiExtended.object().keys({
    search: JoiExtended.string().trim().min(3).max(255),
    role: JoiExtended.string().valid(...roles),
    limit: JoiExtended.number().integer().min(5).max(500),
    page: JoiExtended.number().integer().min(1),
    sort: JoiExtended.string().valid('createdAt','-createdAt','name','-name','email','-email','phone','-phone','role','-role','status','-status'),
  }),
};

const updateCart = {
  body: JoiExtended.object().keys({
    products: JoiExtended.array().items(JoiExtended.object().keys({
      id: JoiExtended.string().custom(objectId).required(),
      quantity: JoiExtended.number().integer().min(0).required(),
    })).required(),
  }),
};

const addToFavorite = {
  body: JoiExtended.object().keys({
    productId: JoiExtended.string().custom(objectId).required(),
  }),
};

const getFavoriteList = {
  query: JoiExtended.object().keys({
    limit: JoiExtended.number().integer().min(5).max(100),
    page: JoiExtended.number().integer().min(1),
  }),
};

const createUserGroup = {
  body: JoiExtended.object().keys({
    name_ar: JoiExtended.string().trim().min(1).max(255).required(),
    name_en: JoiExtended.string().trim().min(3).max(255).required(),
    permissions: JoiExtended.array().items(JoiExtended.object({
      permission: JoiExtended.string().trim().required(),
      group: JoiExtended.string().trim().required(),
    })).required(),
    active: JoiExtended.boolean()
  }),
};

const updateUserGroup = {
  params: JoiExtended.object().keys({
    id: JoiExtended.string().custom(objectId).required()
  }),
  body: JoiExtended.object().keys({
    name_ar: JoiExtended.string().trim().min(1).max(255),
    name_en: JoiExtended.string().trim().min(3).max(255),
    permissions: Joi.array().items(Joi.object({
      permission: Joi.string().trim().required(),
      group: Joi.string().trim().required(),
    })),
    active: JoiExtended.boolean()
  }),
};

const getUserGroupList = {
  query: JoiExtended.object().keys({
    limit: JoiExtended.number().integer().min(5).max(500),
    page: JoiExtended.number().integer().min(1),
    sort: JoiExtended.string().valid('createdAt','-createdAt','name_ar','-name_ar','name_en','-name_en','active','-active'),
  }),
};

module.exports = {
  createUser,
  updateUser,
  getUserList,
  createUserGroup,
  updateUserGroup,
  getUserGroupList,
  updateProfile,
  updateCart,
  addToFavorite,
  getFavoriteList,
  userId,
  favoriteDelete,
  groupId
};