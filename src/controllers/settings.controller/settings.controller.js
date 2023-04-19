const logger = require('../../config/logger');
const ApiError = require('../../helpers/ApiError');
const pick = require('../../helpers/pick');
const Shipping = require('../../models/settings.model/shipping.model');
const ItemSize = require('../../models/settings.model/items_size.model');
const ItemGroup = require('../../models/settings.model/items_group.model');
const ItemCategory = require('../../models/settings.model/items_category.model');
const Purity = require('../../models/settings.model/purity.model');
const OrderStatus = require('../../models/settings.model/order_status.model');
const Unit = require('../../models/settings.model/units.model');
const PaymentMethod = require('../../models/settings.model/payment_method.model');
const Complaints = require('../../models/settings.model/complaints.model');
const Upload = require('../../models/upload.model/upload.model');
const category_hero_product = require('../../models/settings.model/category_hero_product.model');
const SystemInfo = require('../../models/system_info.model/system_info.model');
const fileService = require("../../services/file.service");
const { sendSendTemplateMail } = require('../../services/mail.service');
const { nanoid } = require('nanoid');
const convertObjectId = require('../../helpers/convertObjectId');
const catchAsync = require('../../helpers/catchAsync');

/**************    Shipping   ******************* */
const createShipping = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['company', 'price', 'time']);
    try{
        const shipping = await Shipping.create(body);
        return res.status(200).json({
            status: 200,
            message: 'Shipping created',
            data: shipping
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

const updateShipping = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['company', 'price', 'time']);
    const shippingId = req.params.id;
    try{
        const update = await Shipping.updateOne({ _id: convertObjectId(shippingId) },body);
        if(update.nModified == 0){
            return res.status(404).json({
                status: 404,
                message: 'Shipping not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Shipping updated'
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

const getShippingList = catchAsync(async (req, res, next) => {
    const filter = {};
    const options = pick(req.query, ['sort', 'limit', 'page']);
    if(!options.sort || options.sort === ''){
        options.sort = "-createdAt";
    }
    options.select = "id company price time createdAt";
    const result = await Shipping.paginate(filter, options);
    return res.status(200).json({
        status: 200,
        message: '',
        data: result
    });
});

const deleteShipping = catchAsync(async (req, res, next) => {
    const shippingId = req.params.id;
    try{
        const shipping = await Shipping.findOne({ _id: convertObjectId(shippingId) },'id');
        if(!shipping){
            return res.status(404).json({
                status: 404,
                message: 'Shipping not found',
            });
        }
        await shipping.remove();
        return res.status(200).json({
            status: 200,
            message: 'Shipping deleted successfully.',
        });
    }
    catch(e){
        return res.status(404).json({
            status: 404,
            message: 'Shipping not found',
        });
    }
});
/************************************************ */


/**************    ItemSize   ******************* */
const createItemSize = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar', 'unit', 'active']);
    try{
        const itemSize = await ItemSize.create(body);
        return res.status(200).json({
            status: 200,
            message: 'Item Size created',
            data: itemSize
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

const updateItemSize = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar', 'unit','active']);
    const itemSizeId = req.params.id;
    try{
        const update = await ItemSize.updateOne({ _id: convertObjectId(itemSizeId) },body);
        if(update.nModified == 0){
            return res.status(404).json({
                status: 404,
                message: 'Item Size not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Item Size updated'
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

const getItemSizeList = catchAsync(async (req, res, next) => {
    const filter = {};
    const options = pick(req.query, ['sort', 'limit', 'page']);
    if(!options.sort || options.sort === ''){
        options.sort = "-createdAt";
    }
    options.select = "id name_en name_ar unit createdAt";
    const result = await ItemSize.paginate(filter, options);
    return res.status(200).json({
        status: 200,
        message: '',
        data: result
    });
})

const deleteItemSize = catchAsync(async (req, res, next) => {
    const itemSizeId = req.params.id;
    try{
        const itemSize = await ItemSize.findOne({ _id: convertObjectId(itemSizeId) },'id');
        if(!itemSize){
            return res.status(404).json({
                status: 404,
                message: 'Item Size not found',
            });
        }
        await itemSize.remove();
        return res.status(200).json({
            status: 200,
            message: 'Item Size deleted successfully.',
        });
    }
    catch(e){
        return res.status(404).json({
            status: 404,
            message: 'Item Size not found',
        });
    }
});
/************************************************ */

/**************    ItemGroup   ******************* */
const createItemGroup = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar', 'abbreviation','active','images']);
    try{
        if(body.images){
            const validImages = await _validateUploads(body.images);
            if(!validImages){
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid images'
                });  
            }
        }
        const itemGroup = await ItemGroup.create(body);
        return res.status(200).json({
            status: 200,
            message: 'Item Group created',
            data: itemGroup
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

const updateItemGroup = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar', 'abbreviation','active']);
    const itemGroupId = req.params.id;
    try{
        if(body.images){
            const validImages = await _validateUploads(body.images);
            if(!validImages){
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid images'
                });  
            }
        }
        const update = await ItemGroup.updateOne({ _id: convertObjectId(itemGroupId) },body);
        if(update.nModified == 0){
            return res.status(404).json({
                status: 404,
                message: 'Item Group not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Item Group updated'
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

const getItemGroup = catchAsync(async (req,res,next)=>{
    const id = convertObjectId(req.params.id);
    const group = await ItemGroup.findOne({ _id: convertObjectId(id) }).populate('images');
    if(!group){
        return res.status(404).json({
            status: 404,
            message: 'Group not found'
        });
    }
    return res.status(200).json({
        status: 200,
        message: '',
        data: group
    });
});

const getItemGroupList = catchAsync(async (req, res, next) => {
    const filter = {};
    const options = pick(req.query, ['sort', 'limit', 'page']);
    if(!options.sort || options.sort === ''){
        options.sort = "-createdAt";
    }
    if(req.session?.user?.role === 'admin'){
        options.select = "id name_en name_ar abbreviation images active createdAt";
    }
    else{
        filter.active = true;
        options.select = "id name_en name_ar abbreviation images";
    }
    options.populate = {
        path: 'images',
        select: { link: 1, file_type: 1 }
    };
    const result = await ItemGroup.paginate(filter, options);
    return res.status(200).json({
        status: 200,
        message: '',
        data: result
    });
});

const deleteItemGroup = catchAsync(async (req, res, next) => {
    const itemGroupId = req.params.id;
    try{
        const itemGroup = await ItemGroup.findOne({ _id: convertObjectId(itemGroupId) },'id');
        if(!itemGroup){
            return res.status(404).json({
                status: 404,
                message: 'Item Group not found',
            });
        }
        await itemGroup.remove();
        return res.status(200).json({
            status: 200,
            message: 'Item Group deleted successfully.',
        });
    }
    catch(e){
        return res.status(404).json({
            status: 404,
            message: 'Item Group not found',
        });
    }
});
/************************************************ */

/**************    ItemCategory   ******************* */
const createItemCategory = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar','abbreviation','isKenf','active','images']);
    try{
        if(body.images){
            const validImages = await _validateUploads(body.images);
            if(!validImages){
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid images'
                });  
            }
        }
        const itemCategory = await ItemCategory.create(body);
        return res.status(200).json({
            status: 200,
            message: 'Item Category created',
            data: itemCategory
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

const updateItemCategory = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar','abbreviation','isKenf','active','images']);
    const itemCategoryId = req.params.id;
    try{
        if(body.images){
            const validImages = await _validateUploads(body.images);
            if(!validImages){
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid images'
                });  
            }
        }
        const update = await ItemCategory.updateOne({ _id: convertObjectId(itemCategoryId) },body);
        if(update.nModified == 0){
            return res.status(404).json({
                status: 404,
                message: 'Item Category not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Item Category updated'
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

const getItemCategoryList = catchAsync(async (req, res, next) => {
    const filter = pick(req.query, ['isKenf']);
    const options = pick(req.query, ['sort', 'limit', 'page']);
    if(!options.sort || options.sort === ''){
        options.sort = "-createdAt";
    }
    if(req.session?.user?.role === 'admin'){
        options.select = "id name_en name_ar kenf_collection abbreviation images isKenf active createdAt";
    }
    else{
        filter.active = true;
        options.select = "id name_en name_ar kenf_collection abbreviation images isKenf";
    }
    options.populate = {
        path: 'images',
        select: { link: 1, file_type: 1 }
    };
    const result = await ItemCategory.paginate(filter, options);
    return res.status(200).json({
        status: 200,
        message: '',
        data: result
    });
});

const deleteItemCategory = catchAsync(async (req, res, next) => {
    const itemCategoryId = req.params.id;
    try{
        const itemCategory = await ItemCategory.findOne({ _id: convertObjectId(itemCategoryId) },'id images');
        if(!itemCategory){
            return res.status(404).json({
                status: 404,
                message: 'Item Category not found',
            });
        }
        await itemCategory.remove();
        return res.status(200).json({
            status: 200,
            message: 'Item Category deleted successfully.',
        });
    }
    catch(e){
        return res.status(404).json({
            status: 404,
            message: 'Item Category not found',
        });
    }
});
const getItemCategory = catchAsync(async (req, res, next) => {
    try {
        const categoryId = req.params.cat_id;
        const groupId = req.params.group_id;
        let category = await ItemCategory.findOne({ _id: convertObjectId(categoryId),...(req.user?.role !== 'admin' ? {active: true} : {} ) }).populate('images','id link');
        if(!category){
            return res.status(404).json({
                status: 404,
                message: 'Item Category not found',
            });
        }
        let heroProduct;
        if(!groupId){
            heroProduct = await category_hero_product.findOne({
                category: convertObjectId(categoryId)
            }).populate({
                path : 'product',
                select: 'id name_ar name_en mainImage images.0',
                populate : [
                    {
                        path : 'mainImage',
                        select: 'id link'
                    },
                    {
                        path : 'images.0',
                        select: 'id link'
                    }]
            });
        }
        else{
            heroProduct = await category_hero_product.findOne({
              category: convertObjectId(categoryId),
              group: convertObjectId(groupId)
            }).populate({
                path : 'product',
                select: 'id name_ar name_en mainImage images.0',
                populate : [
                    {
                        path : 'mainImage',
                        select: 'id link'
                    },
                    {
                        path : 'images.0',
                        select: 'id link'
                    }]
            });
        }
        category = category.toJSON();
        if(heroProduct?.product){
            category.heroProduct = heroProduct.product;
        }
        return res.status(200).json({
            status: 200,
            message: '',
            data: category
        });
    } catch (error) {
        return res.status(404).json({
            status: 404,
            message: 'Item Category not found',
        });
    }
});
/************************************************ */

/**************    Purity   ******************* */
const createPurity = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar', 'active']);
    try{
        const purity = await Purity.create(body);
        return res.status(200).json({
            status: 200,
            message: 'Purity created',
            data: purity
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

const updatePurity = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar', 'active']);
    const purityId = req.params.id;
    try{
        const update = await Purity.updateOne({ _id: convertObjectId(purityId) },body);
        if(update.nModified == 0){
            return res.status(404).json({
                status: 404,
                message: 'Purity not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Purity updated'
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

const getPurityList = catchAsync(async (req, res, next) => {
    const filter = {};
    const options = pick(req.query, ['sort', 'limit', 'page']);
    if(!options.sort || options.sort === ''){
        options.sort = "-createdAt";
    }
    options.select = "id name_en name_ar active createdAt";
    const result = await Purity.paginate(filter, options);
    return res.status(200).json({
        status: 200,
        message: '',
        data: result
    });
});

const deletePurity = catchAsync(async (req, res, next) => {
    const purityId = req.params.id;
    try{
        const purity = await Purity.findOne({ _id: convertObjectId(purityId) },'id');
        if(!purity){
            return res.status(404).json({
                status: 404,
                message: 'Purity not found',
            });
        }
        await purity.remove();
        return res.status(200).json({
            status: 200,
            message: 'Purity deleted successfully.',
        });
    }
    catch(e){
        return res.status(404).json({
            status: 404,
            message: 'Purity not found',
        });
    }
});
/************************************************ */

/**************    OrderStatus   ******************* */
const createOrderStatus = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar', 'active']);
    try{
        const orderStatus = await OrderStatus.create(body);
        return res.status(200).json({
            status: 200,
            message: 'Order Status created',
            data: orderStatus
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

const updateOrderStatus = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar', 'active']);
    const orderStatusId = req.params.id;
    try{
        const update = await OrderStatus.updateOne({ _id: convertObjectId(orderStatusId) },body);
        if(update.nModified == 0){
            return res.status(404).json({
                status: 404,
                message: 'Order Status not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Order Status updated'
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

const getOrderStatusList = catchAsync(async (req, res, next) => {
    const filter = {};
    const options = pick(req.query, ['sort', 'limit', 'page']);
    if(!options.sort || options.sort === ''){
        options.sort = "-createdAt";
    }
    options.select = "id name_en name_ar active createdAt";
    const result = await OrderStatus.paginate(filter, options);
    return res.status(200).json({
        status: 200,
        message: '',
        data: result
    });
});

const deleteOrderStatus = catchAsync(async (req, res, next) => {
    const orderStatusId = req.params.id;
    try{
        const orderStatus = await OrderStatus.findOne({ _id: convertObjectId(orderStatusId) },'id');
        if(!orderStatus){
            return res.status(404).json({
                status: 404,
                message: 'Order Status not found',
            });
        }
        await orderStatus.remove();
        return res.status(200).json({
            status: 200,
            message: 'Order Status deleted successfully.',
        });
    }
    catch(e){
        return res.status(404).json({
            status: 404,
            message: 'Order Status not found',
        });
    }
});
/************************************************ */

/**************    Unit   ******************* */
const createUnit = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar', 'active']);
    try{
        const unit = await Unit.create(body);
        return res.status(200).json({
            status: 200,
            message: 'Unit created',
            data: unit
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

const updateUnit = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar', 'active']);
    const unitId = req.params.id;
    try{
        const update = await Unit.updateOne({ _id: convertObjectId(unitId) },body);
        if(update.nModified == 0){
            return res.status(404).json({
                status: 404,
                message: 'Unit not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Unit updated'
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

const getUnitList = catchAsync(async (req, res, next) => {
    const filter = {};
    const options = pick(req.query, ['sort', 'limit', 'page']);
    if(!options.sort || options.sort === ''){
        options.sort = "-createdAt";
    }
    options.select = "id name_en name_ar active createdAt";
    const result = await Unit.paginate(filter, options);
    return res.status(200).json({
        status: 200,
        message: '',
        data: result
    });
});

const deleteUnit = catchAsync(async (req, res, next) => {
    const unitId = req.params.id;
    try{
        const unit = await Unit.findOne({ _id: convertObjectId(unitId) },'id');
        if(!unit){
            return res.status(404).json({
                status: 404,
                message: 'Unit not found',
            });
        }
        await unit.remove();
        return res.status(200).json({
            status: 200,
            message: 'Unit deleted successfully.',
        });
    }
    catch(e){
        return res.status(404).json({
            status: 404,
            message: 'Unit not found',
        });
    }
});
/************************************************ */

/**************    Payment Method   ******************* */
const createPaymentMethod = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar', 'active']);
    try{
        const paymentMethod = await PaymentMethod.create(body);
        return res.status(200).json({
            status: 200,
            message: 'Payment Method created',
            data: paymentMethod
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

const updatePaymentMethod = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_en', 'name_ar', 'active']);
    const paymentMethodId = req.params.id;
    try{
        const update = await PaymentMethod.updateOne({ _id: convertObjectId(paymentMethodId) },body);
        if(update.nModified == 0){
            return res.status(404).json({
                status: 404,
                message: 'Payment Method not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Payment Method updated'
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

const getPaymentMethodList = catchAsync(async (req, res, next) => {
    const filter = {};
    const options = pick(req.query, ['sort', 'limit', 'page']);
    if(!options.sort || options.sort === ''){
        options.sort = "-createdAt";
    }
    options.select = "id name_en name_ar active createdAt";
    const result = await PaymentMethod.paginate(filter, options);
    return res.status(200).json({
        status: 200,
        message: '',
        data: result
    });
});

const deletePaymentMethod = catchAsync(async (req, res, next) => {
    const paymentMethodId = req.params.id;
    try{
        const paymentMethod = await PaymentMethod.findOne({ _id: convertObjectId(paymentMethodId) },'id');
        if(!paymentMethod){
            return res.status(404).json({
                status: 404,
                message: 'Payment Method not found',
            });
        }
        await paymentMethod.remove();
        return res.status(200).json({
            status: 200,
            message: 'Payment Method deleted successfully.',
        });
    }
    catch(e){
        return res.status(404).json({
            status: 404,
            message: 'Payment Method not found',
        });
    }
});
/************************************************ */

/**************    Complaints   ******************* */
const createComplaint = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['email', 'name', 'title','complaints']);
    try{
        if(!req.files?.files){
            return res.status(400).json({
                status: 400,
                message: 'Files is required'
            });
        }
        body.images = _uploadComplaintImages(req.files.files,req.user.id);
        body.user = req.user.id;
        const complaints = await Complaints.create(body);
        return res.status(200).json({
            status: 200,
            message: 'Complaint created'
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

const answerComplaint = catchAsync(async (req, res, next) => {
    const answer = req.body.answer;
    const complaintId = req.params.id;
    try{
        const complaint = await Complaints.findOne({ _id: convertObjectId(complaintId) });
        if(!complaint){
            return res.status(404).send({
                status: 404,
                message: "Complaint not found"
            });
        }
        let mailResponse = await sendSendTemplateMail(email, 'Answer of your complaints in kenf', __dirname + '/../answer.html',  { usercode: answer });
        if(!mailResponse){
            return res.status(500).send({
                status: 500,
                message: "Internal server error, couldn't send email"
            });
        }
        complaint.answer = answer;
        await complaint.save();
        return res.status(200).json({
            status: 200,
            message: 'Complain answered.'
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

const getComplaintList = catchAsync(async (req, res, next) => {
    const filter = {};
    const options = pick(req.query, ['sort', 'limit', 'page']);
    if(!options.sort || options.sort === ''){
        options.sort = "-createdAt";
    }
    if(req.user?.role === 'admin'){
        options.select = "id email name title complaints images answer user createdAt";
    }
    else{
        filter.user = req.user.id;
        options.select = "id email name title complaints images answer createdAt";
    }
    const result = await Complaints.paginate(filter, options);
    return res.status(200).json({
        status: 200,
        message: '',
        data: result
    });
});

const deleteComplaint = catchAsync(async (req, res, next) => {
    const complaintId = req.params.id;
    try{
        const complaint = await Complaints.findOne({ _id: convertObjectId(complaintId) },'id images');
        if(!complaint){
            return res.status(404).json({
                status: 404,
                message: 'Complaint not found',
            });
        }
        if(complaint.images && Array.isArray(complaint.images) && complaint.images.length > 0){
            for(let i=0;i<complaint.images.length;i++){
                let deleted = fileService.deleteFile(complaint.images[i]);
                if(!deleted){
                    return res.status(500).json({
                        status: 500,
                        message: 'Not able to delete images',
                    });
                }
            }
        }
        await complaint.remove();
        return res.status(200).json({
            status: 200,
            message: 'Complaint deleted successfully.',
        });
    }
    catch(e){
        return res.status(404).json({
            status: 404,
            message: 'Complaint not found',
        });
    }
});

const _uploadComplaintImages = (files,userId) => {
    const allowed_file_mime = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    const allowed_file_ext = ['png', 'jpeg', 'jpg', 'gif'];
    const file_extensions = [];
    const file_names = [];
    const results = [];
    if(Array.isArray(files)){
        for(let i=0;i<files.length;i++){
            file_extensions[i] = files[i].name.slice(
                ((files[i].name.lastIndexOf('.') - 1) >>> 0) + 2
            );
            if (!allowed_file_ext.includes(file_extensions[i])) {
                throw new ApiError(400,"Invalid file");
            }
            if (!allowed_file_mime.includes(files[i].mimetype)) {
                throw new ApiError(400,"Invalid file");
            }
            file_names[i] = nanoid() + '.' + file_extensions[i];
        }
        for(let i=0;i<files.length;i++){
            results[i] = fileService.saveFile(files[i],'complaint/'+file_names[i],'public', userId);
        }
        
    }
    else{
        file_extensions[0] = files.name.slice(
            ((files.name.lastIndexOf('.') - 1) >>> 0) + 2
        );
        if (!allowed_file_ext.includes(file_extensions[0])) {
            throw new ApiError(400,"Invalid file");
        }
        if (!allowed_file_mime.includes(files[i].mimetype)) {
            throw new ApiError(400,"Invalid file");
        }
        file_names[0] = nanoid() + '.' + file_extensions[0];
        results[0] = fileService.saveFile(files,'complaint/'+file_names[0],'public', userId);
    }
    return results;
};
/************************************************ */

/**************    SystemInfo   ******************* */
const updateSystemInfo = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['app_name', 'phone', 'city','region','zip','address','vat','vat_number','commission','currency','logo']);
    try {
        let system = await SystemInfo.findOneAndUpdate({}, body, {
          new: true
        });
        return res.status(200).json({
            status: 200,
            message: 'System info updated',
            data: system
        });
    } catch (err) {
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });  
    }
});

const getSystemInfo = catchAsync(async (req, res, next) => {
    try {
        const system = await SystemInfo.findOne();
        return res.status(200).json({
            status: 200,
            message: '',
            data: system
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });  
    }
});
/************************************************ */



const _validateUploads = async(ids) => {
    for(let i=0;i<ids.length;i++){
        ids[i] = convertObjectId(ids[i]);
    }
    const count = await Upload.countDocuments({ _id: { $in: ids } });
    if(ids.length != count){
        return false;
    }
    return true;
}


module.exports = {
    createShipping,
    updateShipping,
    getShippingList,
    deleteShipping,
    createItemSize,
    updateItemSize,
    getItemSizeList,
    deleteItemSize,
    createItemGroup,
    updateItemGroup,
    getItemGroupList,
    deleteItemGroup,
    createItemCategory,
    updateItemCategory,
    getItemCategoryList,
    deleteItemCategory,
    createPurity,
    updatePurity,
    getPurityList,
    deletePurity,
    createOrderStatus,
    updateOrderStatus,
    getOrderStatusList,
    deleteOrderStatus,
    createUnit,
    updateUnit,
    getUnitList,
    deleteUnit,
    createPaymentMethod,
    updatePaymentMethod,
    getPaymentMethodList,
    deletePaymentMethod,
    createComplaint,
    answerComplaint,
    getComplaintList,
    deleteComplaint,
    updateSystemInfo,
    getSystemInfo,
    getItemCategory,
    getItemGroup
}