const logger = require('../../config/logger');
const ApiError = require('../../helpers/ApiError');
const pick = require('../../helpers/pick');
const Seller = require('../../models/seller.model/seller.model');
const fileService = require("../../services/file.service");
const { nanoid } = require('nanoid');
const convertObjectId  = require('../../helpers/convertObjectId');
const catchAsync = require('../../helpers/catchAsync');

const createSeller = catchAsync(async (req, res, next) => {
  const body = pick(req.body, ['name_en', 'name_ar', 'email','phone','address_en','address_ar','description_en','description_ar','city','region','zip']);
  try{
      if(req.files?.documents){
          body.documents = _uploadDocuments(req.files.documents,req.user.id);
      }
      const seller = await Seller.create(body);
      return res.status(200).json({
          status: 200,
          message: 'Seller created',
          data: seller
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

const updateSeller = catchAsync(async (req, res, next) => {
  const body = pick(req.body, ['name_en', 'name_ar', 'email','phone','address_en','address_ar','description_en','description_ar','city','region','zip']);
  const sellerId = req.params.id;
  const deleteDocuments = req.body.deleteDocuments;
  try{
      if(deleteDocuments && Array.isArray(deleteDocuments) && deleteDocuments.length > 0){
          const seller = await Seller.findOne({ _id: convertObjectId(sellerId) })
          if(!seller){
              return res.status(404).json({
                  status: 404,
                  message: 'Seller not found',
              });
          }
          for(let i=0;i<deleteDocuments.length;i++){
              if(!seller.documents.includes(deleteDocuments[i])){
                  return res.status(400).json({
                      status: 400,
                      message: 'Invalid deleted document',
                  });
              }
          }
          for(let i=0;i<deleteDocuments.length;i++){
              let deleted = fileService.deleteFile(deleteDocuments[i]);
              if(!deleted){
                  return res.status(500).json({
                      status: 500,
                      message: 'Not able to delete images',
                  });
              }
          }
          body.documents = seller.documents.filter((val)=>{
              for(let i=0;i<deleteDocuments.length;i++){
                  if(deleteDocuments[i] === val){
                      return false;
                  }
              }
              return true;
          });
      }
      if(req.files?.documents){
          let newDocuments = _uploadDocuments(req.files.documents,req.user.id);
          if(body.documents && Array.isArray(body.documents)){
              body.documents = body.documents.concat(newDocuments);
          }
          else{
              body.documents = newDocuments;
          }
      }
      const update = await Seller.updateOne({ _id: convertObjectId(sellerId) },body);
      if(update.nModified == 0){
          return res.status(404).json({
              status: 404,
              message: 'Seller not found',
          });
      }
      return res.status(200).json({
          status: 200,
          message: 'Seller updated'
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

const getSellerList = catchAsync(async (req, res, next) => {
  const filter = {};
  const options = pick(req.query, ['sort', 'limit', 'page']);
  if(!options.sort || options.sort === ''){
      options.sort = "-createdAt";
  }
  options.select = "id name_en name_ar email phone city region active createdAt";
  const result = await Seller.paginate(filter, options);
  return res.status(200).json({
      status: 200,
      message: '',
      data: result
  });
});

const getSellerById = catchAsync(async (req, res, next) => {
    const sellerId = req.params.id;
    try{
        const seller = await Seller.findOne({ _id: convertObjectId(sellerId) });
        if(!seller){
            return res.status(404).json({
                status: 404,
                message: 'Seller not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: '',
            data: seller
        });
    }
    catch(e){
        return res.status(404).json({
            status: 404,
            message: 'Seller not found',
        });
    }
});

const deleteSeller = catchAsync(async (req, res, next) => {
  const sellerId = req.params.id;
  try{
      const seller = await Seller.findOne({ _id: convertObjectId(sellerId) },'id documents');
      if(!seller){
          return res.status(404).json({
              status: 404,
              message: 'Seller not found',
          });
      }
      if(seller.documents && Array.isArray(seller.documents) && seller.documents.length > 0){
          for(let i=0;i<seller.documents.length;i++){
              let deleted = fileService.deleteFile(seller.documents[i]);
              if(!deleted){
                  return res.status(500).json({
                      status: 500,
                      message: 'Not able to delete documents',
                  });
              }
          }
      }
      await Seller.deleteOne({ _id: seller.id });
      return res.status(200).json({
          status: 200,
          message: 'Seller deleted successfully.',
      });
  }
  catch(e){
      return res.status(404).json({
          status: 404,
          message: 'Seller not found',
      });
  }
});

const _uploadDocuments = (files,userId) => {
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
            results[i] = fileService.saveFile(files[i],'seller/documents/'+file_names[i],'private',userId);
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
        results[0] = fileService.saveFile(files,'seller/documents/'+file_names[0],'private',userId);
    }
    return results;
}

module.exports = {
    createSeller,
    updateSeller,
    getSellerList,
    getSellerById,
    deleteSeller,
}