const logger = require('../../config/logger');
const ApiError = require('../../helpers/ApiError');
const pick = require('../../helpers/pick');
const Order = require('../../models/order.model/order.model');
const User = require('../../models/user.model/user.model');
const Product = require('../../models/products.model/products.model');
const Coupon = require('../../models/marketing.model/coupon.model');
const Shipping = require('../../models/settings.model/shipping.model');
const { nanoid } = require('nanoid');
const convertObjectId  = require('../../helpers/convertObjectId');
const catchAsync = require('../../helpers/catchAsync');
const crypto = require('crypto');
const config = require('../../config/config');
const axios = require('axios');
const moment = require('moment');
const tryotoService = require('../../services/tryoto.service');


const initiatePaymentSession = catchAsync(async(req,res,next)=>{
    try{
        const response = await axios.post(config.payment_gateway.url+'/v2/InitiateSession',{
            CustomerIdentifier: req.user.id,
        },{
            headers: {
                Authorization: "Bearer "+config.payment_gateway.token
            }
        });
        return res.status(200).json({
            status: 200,
            message: response.data.Message,
            data: response.data.Data
        });
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: "Couldn't initiate payment session, Inetrnal server error",
        });
    }
});

const executePayment = catchAsync(async(req,res,next)=>{
    const body = pick(req.body,['sessionId','cart','items','coupon','shipping']);
    const user = await User.findOne({ _id: convertObjectId(req.user.id) },'id email phone address billingAddress status '+(body.cart ? ' cart' : ''));
    if(!user?.status){
        return res.status(401).json({
            status: 401,
            message: "Unauthenticated"
        });
    }
    //Validate Deliver and Billing Address.
    if(!user.address || 
        !user.address.fullname || user.address.fullname === '' ||
        !user.address.phone || user.address.phone === '' ||
        !user.address.country || user.address.country === '' ||
        !user.address.city || user.address.city === '' ||
        !user.address.zipCode || user.address.zipCode === '' ||
        !user.address.street || user.address.street === ''
    ){
        return res.status(400).json({
            status: 400,
            message: "Address is complete, Please complete address."
        });
    }
    if(!user.billingAddress || 
        !user.billingAddress.fullname || user.billingAddress.fullname === '' ||
        !user.billingAddress.phone || user.billingAddress.phone === '' ||
        !user.billingAddress.country || user.billingAddress.country === '' ||
        !user.billingAddress.city || user.billingAddress.city === '' ||
        !user.billingAddress.zipCode || user.billingAddress.zipCode === '' ||
        !user.billingAddress.street || user.billingAddress.street === ''
    ){
        return res.status(400).json({
            status: 400,
            message: "Billing address is complete, Please complete billing address."
        });
    }
    //Fetch and Validate items
    let items;
    let productsIds
    if(body.cart){
        items = user.cart;
        if(!items || items.length == 0){
            return res.status(400).json({
                status: 400,
                message: "Your cart is empty!"
            });
        }
        items = items.filter((val)=>(val.quantity !== 0));
        productsIds = items.map((val)=>(val.id));
    }
    else{
        items = body.items;
        items = items.filter((val)=>(val.quantity !== 0));
        items = items.map((val)=>{return{...val,id: convertObjectId(val.id)};})
        productsIds = items.map((val)=>(convertObjectId(val.id)));
    }
    const products = await Product.find({ _id: { $in: productsIds }, active: true },'id quantity extra_price active');
    const notFoundProducts = [];
    const outofStockProducts = [];
    for(let i=0;i<items.length;i++){
        let foundProduct = false;
        for(let j=0;j<products.length;j++){
            if(items[i].id.equals(products[j].id)){
                foundProduct = true;
                items[i].price = products[j].extra_price;
                if(products[j].quantity < items[i].quantity){
                    outofStockProducts.push(items[i].id);
                }
                break;
            }
        }
        if(!foundProduct){
            notFoundProducts.push(items[i].id);
        }
    }
    if(notFoundProducts.length != 0){
        return res.status(404).json({
            status: 404,
            message: "Products not found",
            error: notFoundProducts
        });
    }
    if(outofStockProducts.length != 0){
        return res.status(400).json({
            status: 404,
            message: "Products are out of stock",
            error: outofStockProducts
        });
    }
    const shipping = await Shipping.findOne({ _id: convertObjectId(body.shipping)});
    if(!shipping){
        return res.status(404).json({
            status: 404,
            message: "Shipping not found",
        });
    }
    let totalShoppingBag = 0;
    let effectivePrice = 0;
    let tax = 0;
    let totalPrice = 0;
    let discount = 0;
    let shippingPrice = shipping.price;
    items.map(item => {
        totalShoppingBag += (item.price * item.quantity);
    });
    let coupon;
    if(body.coupon){
        coupon = await Coupon.findOne({ _id: convertObjectId(body.coupon), active: true });
        if(!coupon){
            return res.status(404).json({
                status: 404,
                message: "Coupon not found",
            });
        }
        if(coupon.total_purchase_condition && coupon.total_purchase_condition !== 0 && coupon.total_purchase_condition < totalShoppingBag){
            return res.status(400).json({
                status: 400,
                message: "Coupon only applicable if total purchase is above "+coupon.total_purchase_condition,
            });
        }
        if (coupon.discount_type == "percent") {
            discount = coupon.discount * totalShoppingBag / 100;
            if(coupon.maxDiscount){
                let maxDiscount = coupon.max_discount;
                discount = discount > maxDiscount ? maxDiscount : discount;
            }
        } else {
            discount = coupon.discount;
        }
        if(coupon.freeShipping && coupon.freeShipping.length != 0){ 
            if(coupon.freeShipping.includes(shipping.id)){
                shippingPrice = 0;
            }
        }
    }
    effectivePrice = totalShoppingBag - discount;
    if(effectivePrice < 0)
        effectivePrice = 0;
    tax = effectivePrice * 0.15;
    totalPrice = effectivePrice + tax + shippingPrice;
    //Execute Payment
    try{
        let paymentResponse = await axios.post(config.payment_gateway.url+"/v2/ExecutePayment",{
                SessionId: body.sessionId,
                CustomerName: user.billingAddress.fullname,
                //CustomerMobile: user.billingAddress.phone,
                CustomerEmail: user.billingAddress.email,
                InvoiceValue: totalPrice,
                //ExpiryDate: new Date(new Date().getTime() + 30 * 60000).toISOString(),//Expire order after 30 mins
                Language: "en",
                CustomerAddress: {
                    Address: user.billingAddress.street,
                },
                CallBackUrl: config.client_app_url+'/paymentStatus',
                ErrorUrl: config.client_app_url+'/paymentStatus'
            },{
                headers: {
                    Authorization: "Bearer "+config.payment_gateway.token
                }
            });
        if(!paymentResponse.data?.IsSuccess){
            logger.error(paymentResponse);
            return res.status(500).json({
                status: 500,
                message: "Couldn't execute payment, Internal server error"
            });
        }   
        let order = await Order.create({
            shipping: shipping.id,
            customer: user.id,
            items: items,
            ...(coupon && { coupon: coupon.id }),
            price: totalShoppingBag,
            discount: discount,
            effectivePrice: effectivePrice,
            tax: tax,
            shippingPrice: shippingPrice,
            totalPrice: totalPrice,
            paymentInfo: {
                invoiceId: paymentResponse.data.Data.InvoiceId,
            },
            paymentStatus: 'PENDING',
            deliveryInfo: {
                name: user.address.fullname,
                email: user.address.email,
                phone: user.address.phone,
                address: user.address.street,
                city: user.address.city,
                country: user.address.country,
                zipCode: user.address.zipCode,
            },
            billingInfo: {
                name: user.billingAddress.fullname,
                email: user.billingAddress.email,
                phone: user.billingAddress.phone,
                address: user.billingAddress.street,
                city: user.billingAddress.city,
                country: user.billingAddress.country,
                zipCode: user.billingAddress.zipCode,
            },
            cart: body.cart ? true : false
        });
        user.cart = [];
        await user.save();
        return res.status(200).json({
            status: 200,
            message: paymentResponse.data.Message,
            data: paymentResponse.data.Data
        });
    }
    catch(e){
        return res.status(500).json({
            status: 500,
            message: "Couldn't execute payment, Internal server error"
        });
    }
});

const paymentWebhook = catchAsync(async (req, res, next) => {
  const body = pick(req.body,['EventType','Event','DateTime','CountryIsoCode','Data']);
    const signature = req.headers['myfatoorah-signature'];
    if(!signature){
        return res.status(401).json({
            status: 401,
            message: "Unauthorized request"
        });
    }
    const validSignature = _validateWebhookSignature(body,config.payment_gateway.secret,signature);
    if(!validSignature){
        return res.status(401).json({
            status: 401,
            message: "Unauthorized request"
        });
    }
    if(body.EventType === 1){
        let order = await Order.findOne({ "paymentInfo.invoiceId": body.Data.InvoiceId  }).populate('items.product','id name_en name_ar');
        if(!order){
            res.status(404).json({
                status: 404,
                message: "Order not found"
            });
        }
        order.paymentInfo.completedAt =  moment(body.DateTime,'DDMMYYYYhhmmss').toISOString() ;
        order.paymentInfo.paymentId = body.Data.PaymentId;
        order.paymentStatus = body.Data.TransactionStatus;
        await order.save();
        for(let i=0;i<order.items.length;i++){
            await Product.updateOne({ _id: order.items[i].product._id },{ quantity: { $inc: -order.items[i].quantity } })
        }
        let date = new Date();
        let orderId = date.getTime();
        let data = {
            orderId: orderId,
            pickupLocationCode: "W-KENF-01",
            serviceType: "fastDelivery",
            createShipment: true,
            payment_method: "paid",
            amount: order.totalPrice,
            amount_due: 0,
            currency: "SAR",
            customer: {
                name: order.deliveryInfo.name,
                email: order.deliveryInfo.email,
                mobile: order.deliveryInfo.phone,
                address: order.deliveryInfo.address,
                city: order.deliveryInfo.city,
                country: order.deliveryInfo.country,
                postcode: order.deliveryInfo.zipCode,
            },
            items: order.items.map((item) => {
                return {
                    productId: item.product._id,
                    name: item.product.name_en,
                    price: item.price,
                    quantity: item.quantity,
                    sku: item.product._id,
                };
            }),
        };
        try{
            let deliveryResponse = await tryotoService('createOrder','post',data);
            order.tryoto_id = deliveryResponse.data.otoId;
            await order.save();
        }
        catch(e){ logger.error(e); }
    }
    return res.status(200).json({
        status: 200,
        message: "Success"
    });
});

const getPaymentStatus = catchAsync(async (req, res, next) => {
    const paymentId = req.query.paymentId;
    try{
        let paymentStatusResponse = await axios.post(config.payment_gateway.url+"/v2/GetPaymentStatus",{
            Key: paymentId,
            KeyType: "PaymentId",
        },{
            headers: {
                Authorization: "Bearer "+config.payment_gateway.token
            },
        });
        if(!paymentStatusResponse.data?.IsSuccess){
            return res.status(500).json({
                status: 500,
                message: paymentStatusResponse.data.message
            });
        }
        const invoiceId = paymentStatusResponse.data.Data.InvoiceId;
        const order = await Order.findOne({ "paymentInfo.invoiceId": invoiceId },'id customer');
        if(!order){
            return res.status(500).json({ 
                status: 500,
                message: 'Order does not exist' 
            });
        }
        if(!order.customer.equals(convertObjectId(req.user.id))){
            return res.status(403).json({ status: 403, message: 'Forbidden' });
        }
        let transactionsList = paymentStatusResponse.data.Data.InvoiceTransactions;
        let transaction;
        for(let i=0;i<transactionsList.length;i++){
            if(transactionsList[i].PaymentId === paymentId){
                transaction = transactionsList[i];
            }
        }
        if(transaction.TransactionStatus == 'Failed'){
            return res.status(200).json({ IsSuccess: false, transactionStatus: 'Failed', message: transaction.ErrorCode+": "+transaction.Error });
        } else if(transaction.TransactionStatus == 'Succss'){
            return res.status(200).json({ IsSuccess: true, orderId: order.id, transactionStatus: 'Succss', message: 'Transaction completed successfully.' });
        } else {
            return res.status(200).json({ IsSuccess: false, transactionStatus: transaction.TransactionStatus, message: transaction.ErrorCode+": "+transaction.Error });
        }
        
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: "Couldn't find paymentId, Internal server error."
        });
    }
});


const _validateWebhookSignature = (body, secret, myFatoorahSignature) => {
    if (body['Event'] === 'RefundStatusChanged') {
        delete json['Data']['GatewayReference'];
    }

    let unOrderedArray = body['Data'];

    //1- Order all data properties in alphabetic and case insensitive.
    const orderedArray = Object.keys(unOrderedArray).sort((a, b) => a.localeCompare(b));

    //2- Create one string from the data after ordering its key to be like that key=value,key2=value2 ...
    let orderedString = "";
    orderedArray.forEach(key => {
        unOrderedArray[key] = (unOrderedArray[key]) ? unOrderedArray[key] : '';
        orderedString += `${key}=${unOrderedArray[key]},`;
    });
    orderedString = orderedString.slice(0, -1);


    //4- Encrypt the string using HMAC SHA-256 with the secret key from the portal in binary mode.
    let result = crypto.createHmac("sha256", secret).update(orderedString).digest();

    //5- Encode the result from the previous point with base64.
    let hash = result.toString('base64');

    //6- Compare the signature header with the encrypted hash string. If they are equal, then the request is valid and from the MyFatoorah side.
    if(hash !== myFatoorahSignature){
        return false;
    }
    
    return true;
}

module.exports = {
    initiatePaymentSession,
    executePayment,
    paymentWebhook,
    getPaymentStatus
}