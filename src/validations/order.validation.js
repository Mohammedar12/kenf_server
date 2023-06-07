const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const orderId = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  })
}

const ordersList = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(5).max(500),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid('createdAt','-createdAt'),
  }),
};

const invoicesList = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(5).max(500),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid('createdAt','-createdAt'),
  }),
};

const updateOrder = {
  body: Joi.object().keys({
    tryoto_id: Joi.string(),
    shipping: Joi.string().custom(objectId),
    status: Joi.string().valid('WAITING','REJECTED','CANCELED','ACCEPTED', 'SHIPPED', 'PREPARED', 'DELIVERED'),
    rejectReason: Joi.string().min(3).max(1000)
  }),
};

module.exports = {
  orderId,
  ordersList,
  invoicesList,
  updateOrder,
};