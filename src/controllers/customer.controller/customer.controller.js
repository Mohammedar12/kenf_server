const logger = require('../../config/logger');
const pick = require('../../helpers/pick');
const Customer = require('../../models/customer.model/customer.model');
const convertObjectId  = require('../../helpers/convertObjectId');
const catchAsync = require('../../helpers/catchAsync');

const createCustomer = catchAsync(async (req, res, next) => {
  const body = pick(req.body, ['name', 'email', 'phone','address']);
  try{
      const customer = await Customer.create(body);
      return res.status(200).json({
          status: 200,
          message: 'Customer created',
          data: customer
      });
  }
  catch(e){
      logger.error(e);
      return res.status(500).json({
          status: 500,
          message: 'Internal server error'
      });  
  }
});

const updateCustomer = catchAsync(async (req, res, next) => {
  const body = pick(req.body, ['name', 'email', 'phone','address']);
  const customerId = req.params.id;
  try{
      const update = await Customer.updateOne({ _id: convertObjectId(customerId) },body);
      if(update.nModified == 0){
          return res.status(404).json({
              status: 404,
              message: 'Customer not found',
          });
      }
      return res.status(200).json({
          status: 200,
          message: 'Customer updated'
      });
  }
  catch(e){
      logger.error(e);
      return res.status(500).json({
          status: 500,
          message: 'Internal server error'
      });  
  }
});

const getCustomerList = catchAsync(async (req, res, next) => {
  const filter = {};
  const options = pick(req.query, ['sort', 'limit', 'page']);
  if(!options.sort || options.sort === ''){
      options.sort = "-createdAt";
  }
  const result = await Customer.paginate(filter, options);
  return res.status(200).json({
      status: 200,
      message: '',
      data: result
  });
});

const deleteCustomer = catchAsync(async (req, res, next) => {
  const customerId = req.params.id;
  try{
      const customer = await Seller.findOne({ _id: convertObjectId(customerId) },'id');
      if(!customer){
          return res.status(404).json({
              status: 404,
              message: 'Customer not found',
          });
      }
      await customer.remove();
      return res.status(200).json({
          status: 200,
          message: 'Customer deleted successfully.',
      });
  }
  catch(e){
      return res.status(404).json({
          status: 404,
          message: 'Customer not found',
      });
  }
});


module.exports = {
  createCustomer,
  updateCustomer,
  getCustomerList,
  deleteCustomer
}