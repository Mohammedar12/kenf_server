const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    REDIS_URL: Joi.string().required().description('Redis url'),
    REDIS_PREFIX: Joi.string().required().description('Redis prefix'),
    SESSION_SECRET: Joi.string().required().description('Session secret'),
    SESSION_AGE_DAYS: Joi.number().default(30).description('Session max age in days'),
    SMS_GATEWAY_AUTH: Joi.string().required().description('SMS gateway auth token'),
    SMS_GATEWAY_SENDER: Joi.string().required().description('SMS gateway sender'),
    SMTP_SERVICE: Joi.string().required().description('service name that will send the emails'),
    SMTP_USERNAME: Joi.string().required().description('username for email server'), 
    SMTP_PASSWORD: Joi.string().required().description('password for email server'),
    EMAIL_FROM: Joi.string().required().description('the from field in the emails sent by the app'),
    FRONT_END_TOKEN: Joi.string().required().description('frontend app token'),
    PAYMENT_GATEWAY_URL: Joi.string().required().description('payment gateway url'),
    PAYMENT_GATEWAY_TOKEN: Joi.string().required().description('payment gateway token'),
    PAYMENT_GATEWAY_SECRET: Joi.string().required().description('payment gateway secret'),
    PAYMENT_GATEWAY_DEFAULT_CURRENCY: Joi.string().required().description('payment gateway default currency'),
    TRYOTO_REFRESH_TOKEN: Joi.string().required().description('tryoto refresh token'),
    CLIENT_APP_URL: Joi.string().required().description('Client app url'),
    ADMIN_APP_URL: Joi.string().required().description('Admin app url'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      // useCreateIndex: envVars.NODE_ENV === 'development' ? true : false,
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    },
  },
  email: {
    smtp: {
      service: envVars.SMTP_SERVICE,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  redis: {
    url: envVars.REDIS_URL,
    prefix: envVars.REDIS_PREFIX,
  },
  session: {
    secret: envVars.SESSION_SECRET,
    maxAge: envVars.SESSION_AGE_DAYS
  },
  sms: {
    auth: envVars.SMS_GATEWAY_AUTH,
    sender: envVars.SMS_GATEWAY_SENDER,
  },
  frontendToken: envVars.FRONT_END_TOKEN,
  payment_gateway:{
    url: envVars.PAYMENT_GATEWAY_URL,
    token: envVars.PAYMENT_GATEWAY_TOKEN,
    secret: envVars.PAYMENT_GATEWAY_SECRET,
    defaultCurrency: envVars.PAYMENT_GATEWAY_DEFAULT_CURRENCY
  },
  tryoto: {
    refresh_token: envVars.TRYOTO_REFRESH_TOKEN,
  },
  client_app_url: envVars.CLIENT_APP_URL,
  admin_app_url: envVars.ADMIN_APP_URL,
};