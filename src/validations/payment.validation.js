const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const executePayment = {
  body: Joi.object().keys({
    sessionId: Joi.string().required(),
    cart: Joi.boolean().required(),
    items: Joi.alternatives().conditional('cart', { is: false, then: Joi.array().items(Joi.object().keys({
      id: Joi.string().custom(objectId).required(),
      quantity: Joi.number().integer().min(1).required(),
    })).min(1).max(20), otherwise: Joi.forbidden() }),
    coupon: Joi.string().custom(objectId),
    shipping: Joi.string().custom(objectId).required(),
  }),
};

const paymentWebhook = {
  body: Joi.object().keys({
    EventType: Joi.number().integer().required(),
    Event: Joi.string().required(),
    DateTime: Joi.string().required(),
    CountryIsoCode: Joi.string().required(),
    Data: Joi.object().required(),
  }),
};

const getPaymentStatus = {
  query: Joi.object().keys({
    paymentId: Joi.string().required(),
  }),
}

module.exports = {
  executePayment,
  paymentWebhook,
  getPaymentStatus,
};