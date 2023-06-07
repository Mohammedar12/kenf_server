const logger = require('../../config/logger');
const pick = require('../../helpers/pick');
const Shop = require('../../models/shop.model/shop.model');
const Upload = require('../../models/upload.model/upload.model');
const convertObjectId = require('../../helpers/convertObjectId');
const catchAsync = require('../../helpers/catchAsync');

const createShop = catchAsync(async (req, res, next) => {
  const body = pick(req.body, ['seller', 'app_name_en', 'app_name_ar', 'app_abbreviation', 'email','phone','city','region','zip','address_en','address_ar','description_en','description_ar','commission','active','images']);
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
      const shop = await Shop.create(body);
      return res.status(200).json({
          status: 200,
          message: 'Shop created',
          data: shop
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

const updateShop = catchAsync(async (req, res, next) => {
  const body = pick(req.body, ['seller', 'app_name_en', 'app_name_ar', 'app_abbreviation', 'email','phone','city','region','zip','address_en','address_ar','description_en','description_ar','commission','active','images']);
  const shopId = req.params.id;
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
      const update = await Shop.updateOne({ _id: convertObjectId(shopId) },body);
      if(update.nModified == 0){
          return res.status(404).json({
              status: 404,
              message: 'Shop not found',
          });
      }
      return res.status(200).json({
          status: 200,
          message: 'Shop updated'
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

const getShopList = catchAsync(async (req, res, next) => {
  const filter = {};
  const options = pick(req.query, ['sort', 'limit', 'page']);
  if(!options.sort || options.sort === ''){
      options.sort = "-createdAt";
  }
  options.select = "id app_name_en app_name_ar app_abbreviation address_en address_ar email phone city active createdAt";
  const result = await Shop.paginate(filter, options);
  return res.status(200).json({
      status: 200,
      message: '',
      data: result
  });
});

const getShopById = catchAsync(async (req, res, next) => {
    const shopId = req.params.id;
    try{
        const shop = await Shop.findOne({ _id: convertObjectId(shopId) }).populate('images','id link').populate('seller');
        if(!shop){
            return res.status(404).json({
                status: 404,
                message: 'Shop not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: '',
            data: shop
        });
    }
    catch(e){
        return res.status(404).json({
            status: 404,
            message: 'Shop not found',
        });
    }
});

const deleteShop = catchAsync(async (req, res, next) => {
  const shopId = req.params.id;
  try{
      const shop = await Shop.findOne({ _id: convertObjectId(shopId) },'id images');
      if(!shop){
          return res.status(404).json({
              status: 404,
              message: 'Shop not found',
          });
      }
      await Shop.deleteOne({ _id: shop.id });
      return res.status(200).json({
          status: 200,
          message: 'Shop deleted successfully.',
      });
  }
  catch(e){
      return res.status(404).json({
          status: 404,
          message: 'Shop not found',
      });
  }
});

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
    createShop,
    updateShop,
    getShopList,
    getShopById,
    deleteShop,
}