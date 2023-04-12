const Joi = require('joi');
const joiPhoneNumber = require('joi-phone-number');
const { objectId } = require('./custom.validation');

const JoiExtended = Joi.extend(joiPhoneNumber);

const customerId = {
  params: JoiExtended.object().keys({
    id: JoiExtended.string().required().custom(objectId)
  }),
};

const createCustomer = {
  body: JoiExtended.object().keys({
    name: JoiExtended.string().trim().min(3).max(255).required(),
    email: JoiExtended.string().trim().lowercase().email().required(),
    phone: JoiExtended.string().phoneNumber({ defaultCountry: 'SA', format: 'e164', strict: true}).required(),
    address: JoiExtended.string().trim().min(3).max(500).required(),
  }),
};

const updateCustomer = {
  params: JoiExtended.object().keys({
    id: JoiExtended.string().required().custom(objectId)
  }),
  body: JoiExtended.object().keys({
    name: JoiExtended.string().trim().min(3).max(255),
    email: JoiExtended.string().trim().lowercase().email(),
    phone: JoiExtended.string().phoneNumber({ defaultCountry: 'SA', format: 'e164', strict: true}),
    address: JoiExtended.string().trim().min(3).max(500),
  }),
};

const getCustomerList = {
  query: JoiExtended.object().keys({
    limit: JoiExtended.number().integer().min(5).max(500),
    page: JoiExtended.number().integer().min(1),
    sort: JoiExtended.string().valid('createdAt','-createdAt','name','-name','email','-email','phone','-phone'),
  }),
};

module.exports = {
  customerId,
  createCustomer,
  updateCustomer,
  getCustomerList,
};