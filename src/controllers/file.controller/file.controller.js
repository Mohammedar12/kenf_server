const Upload = require('../../models/upload.model/upload.model');
const catchAsync = require('../../helpers/catchAsync');
const ApiError = require('../../helpers/ApiError');
const {nanoid} =require('nanoid');
const fileService = require('../../services/file.service');

const uploadPublicImage = catchAsync(async (req, res, next) => {
  const files = req.files.files;
  if(!files){
    throw new ApiError(400,"Files is required");
  }
  const allowed_file_mime = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  const allowed_file_ext = ['png', 'jpeg', 'jpg', 'gif'];
  const file_extensions = [];
  const file_mimes = [];
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
          file_mimes[i] = files[i].mimetype;
          file_names[i] = nanoid() + '.' + file_extensions[i];
      }
      for(let i=0;i<files.length;i++){
          results[i] = fileService.saveFile(files[i],'images/'+file_names[i],'public');
      }
  }
  else{
      file_extensions[0] = files.name.slice(
          ((files.name.lastIndexOf('.') - 1) >>> 0) + 2
      );
      if (!allowed_file_ext.includes(file_extensions[0])) {
          throw new ApiError(400,"Invalid file");
      }
      if (!allowed_file_mime.includes(files.mimetype)) {
          throw new ApiError(400,"Invalid file");
      }
      file_mimes[0] = files.mimetype;
      file_names[0] = nanoid() + '.' + file_extensions[0];
      results[0] = fileService.saveFile(files,'images/'+file_names[0],'public');
  }
  let insertArr = [];
  for(let i=0;i<results.length;i++){
    insertArr.push({
        user: "6475fe58cefa8d461429a52e",
        // user: req.user.id,
        link: results[i],
        file_type: file_mimes[i],
        access: 'public',
    });
  }
  const result = await Upload.insertMany(insertArr);
  return res.status(200).json({
    status: 200,
    message: 'Images uploaded',
    data: result
  });  
});

module.exports = {
    uploadPublicImage
}