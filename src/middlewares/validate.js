const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../helpers/pick');
const ApiError = require('../helpers/ApiError');

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    const errors = {};
    for(let i=0;i<error.details.length;i++){
      errors[error.details[i].path.filter((v,i)=>i>0).join('.')] = {
        label: error.details[i].context.label,
        message: error.details[i].message,
      }
    }
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage, true, '', errors));
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;