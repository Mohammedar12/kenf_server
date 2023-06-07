const Joi = require('joi');
const joiPhoneNumber = require('joi-phone-number');

const JoiExtended = Joi.extend(joiPhoneNumber);

const signinSendMailOtp = {
  body: JoiExtended.object().keys({
    email: JoiExtended.string().trim().lowercase().required(),
  }),
};

const signinSendMobileOtp = {
  body: JoiExtended.object().keys({
    phone: JoiExtended.string().required().phoneNumber({ defaultCountry: 'SA', format: 'e164', strict: true}),
  }),
};

const signInWithOtp = {
    body: JoiExtended.object().keys({
      type: JoiExtended.string().required().valid('email','phone'),
      otp: JoiExtended.string().required(),
      email: Joi.alternatives().conditional('type', { is: 'email', then: JoiExtended.string().trim().lowercase().email().required(), otherwise: Joi.forbidden() }),
      phone: Joi.alternatives().conditional('type', { is: 'phone', then: JoiExtended.string().required().phoneNumber({ defaultCountry: 'SA', format: 'e164', strict: true}), otherwise: Joi.forbidden() }),
    }),
};

const signInWithPasswordAdmin = {
    body: JoiExtended.object().keys({
        email: JoiExtended.string().trim().lowercase().email().required(),
        password: JoiExtended.string().required(),
    }),
};

const logout = {
  body: JoiExtended.object().keys({
    
  }),
};


module.exports = {
    signinSendMailOtp,
    signinSendMobileOtp,
    signInWithOtp,
    signInWithPasswordAdmin,
    logout
};