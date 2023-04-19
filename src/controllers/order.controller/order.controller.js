const logger = require('../../config/logger');
const ApiError = require('../../helpers/ApiError');
const pick = require('../../helpers/pick');
const Order = require('../../models/order.model/order.model');
const convertObjectId  = require('../../helpers/convertObjectId');
const catchAsync = require('../../helpers/catchAsync');
const config = require('../../config/config');

const ordersList = catchAsync(async(req,res,next)=>{
  const filter = pick(req.query, []);
  const options = pick(req.query, ['sort', 'limit', 'page']);
  if(!options.sort || options.sort === ''){
      options.sort = "-createdAt";
  }
  if(req.user?.role !== 'admin'){
    filter.customer = convertObjectId(req.user.id);
  }
  options.select = "id tryoto_id status totalPrice paymentStatus paymentInfo.invoiceId createdAt";
  if(req.user?.role === 'admin'){
    options.select += " items customer";
    options.populate = [
        {
            path: 'items',
            populate: {
                path: 'product',
                select: 'id name_en name_ar extra_price barcode',
                populate: [
                    {
                        path: 'images',
                        select: 'id link'
                    },
                    {
                        path: 'mainImage',
                        select: 'id link'
                    }
                ]
            }
        },
        {
            path: 'customer',
            select: 'id name'
        },
        {
            path: 'coupon',
            select: 'id code'
        }
    ];
  }
  const result = await Order.paginate(filter, options);
  return res.status(200).json({
      status: 200,
      message: '',
      data: result
  });
});

const invoicesList = catchAsync(async(req,res,next)=>{
    const filter = pick(req.query, []);
    const options = pick(req.query, ['sort', 'limit', 'page']);
    if(!options.sort || options.sort === ''){
        options.sort = "-createdAt";
    }
    if(req.user?.role !== 'admin'){
      filter.customer = convertObjectId(req.user.id);
    }
    filter.status = "DELIVERED";
    filter.paymentStatus = "SUCCESS";
    options.select = "id tryoto_id status totalPrice paymentStatus paymentInfo.invoiceId billingInfo createdAt";
    //options.populate = ['unit', 'mainImage','images','group','shop','purity','category'];
    const result = await Order.paginate(filter, options);
    return res.status(200).json({
        status: 200,
        message: '',
        data: result
    });
});

const deleteOrder = catchAsync(async(req,res,next)=>{
    const orderId = convertObjectId(req.params.id);
    const order = await Order.find({ _id: orderId },'id');
    if(!order){
        return res.status(404).json({
            status: 404,
            message: 'Order not found'
        });
    }
    await Order.deleteOne({ _id: order.id });
    return res.status(200).json({
        status: 200,
        message: 'Order deleted',
    });
});

const getOrder = catchAsync(async(req,res,next)=>{
    const orderId = convertObjectId(req.params.id);
    const order = await Order.find({ _id: orderId }).populate([
        {
            path: 'items.product',
            select: 'id name_en name_er'
        },
        {
            path: 'customer',
            select: 'id name email phone'
        },
        {
            path: 'shipping',
            select: 'id company time'
        },
        {
            path: 'coupon',
            select: 'id code'
        },
    ]);
    if(!order){
        return res.status(404).json({
            status: 404,
            message: 'Order not found'
        });
    }
    return res.status(200).json({
        status: 200,
        message: '',
        data: order
    });
});

const getInvoice = catchAsync(async(req,res,next)=>{
    const orderId = convertObjectId(req.params.id);
    const filter = { _id: orderId, paymentStatus: 'SUCCESS', status: 'DELIVERED' };
    if(req.user?.role !== 'admin'){
        filter.customer = convertObjectId(req.user.id);
    }
    const order = await Order.find(filter,'id tryoto_id shipping items status paymentMethod price discount effectivePrice tax shippingPrice totalPrice paymentInfo.completedAt paymentInfo.invoiceId deliveryInfo billingInfo').populate([
        {
            path: 'items.product',
            select: 'id name_en name_er'
        },
        {
            path: 'shipping',
            select: 'id company time'
        },
    ]);
    if(!order){
        return res.status(404).json({
            status: 404,
            message: 'Invoice not found'
        });
    }
    return res.status(200).json({
        status: 200,
        message: '',
        data: order
    });
});

const updateOrder = catchAsync(async(req,res,next)=>{
    const body = pick(req.body,["tryoto_id","shipping","status","rejectReason"]);
    const orderId = convertObjectId(req.params.id);
    const order = await Order.findOneAndUpdate({ _id: orderId }, body, {
        returnOriginal: false,
        upsert: false
    });
    if(!order){
        return res.status(404).json({
            status: 404,
            message: 'Order not found'
        });
    } 
    return res.status(200).json({
        status: 200,
        message: 'Order updated',
        data: order
    });
});

module.exports = {
    ordersList,
    invoicesList,
    deleteOrder,
    updateOrder,
    getOrder,
    getInvoice
}