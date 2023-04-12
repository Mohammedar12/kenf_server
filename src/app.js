const express = require('express');
const bodyparser = require('body-parser');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const fileUpload = require('express-fileupload');
const { authLimiter } = require('./middlewares/rateLimiter');
const router = require('./routes');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./helpers/ApiError');
const cookieParser = require('cookie-parser');
const i18n = require("i18n");
const redisService = require('./services/redis.service');
const fileService = require('./services/file.service');
const session = require('express-session');
const logger = require('./config/logger');

class App {

  constructor(){
    this.app = express();
    this._configure();
  }

  startApp(){
    return this.app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  }

  _configure(){
    i18n.configure({
      locales:['ar', 'en'],
      directory: __dirname + '/locales',
      register: global,
      defaultLocale:'ar'
    });

    if (config.env !== 'test') {
      this.app.use(morgan.successHandler);
      this.app.use(morgan.errorHandler);
    }
    
    // set security HTTP headers
    this.app.use(helmet());
    this.app.disable('x-powered-by');
    
    // parse urlencoded request body
    this.app.use(express.urlencoded({ extended: true }));
    
    // gzip compression
    this.app.use(compression());
    
    // enable cors
    this.app.use(cors({credentials: true, origin: [config.client_app_url,config.admin_app_url] }));
    
    // limit repeated failed requests to auth endpoints
    if (config.env === 'production') {
      this.app.use('/api/auth', authLimiter);
    }
    
    fileService.registerMiddleware('/api/uploads',this.app);
    
    this.app.use((req, res, next)=> {
        i18n.setLocale(req.headers['accept-language'] || 'ar');
        return next();
    });
    
    // enable this if you run behind a proxy (e.g. nginx)
    this.app.set('trust proxy', 1);
    this.app.use(cookieParser());
    this.app.use(
        session({
          store: redisService.getSessionStore(),
          resave: false, // required: force lightweight session keep alive (touch)
          saveUninitialized: false, // recommended: only save session when data exists
          secret: config.session.secret,
          cookie: {
            secure: config.env === 'production', // if true only transmit cookie over https
            httpOnly: true, // if true prevent client side JS from reading the cookie 
            maxAge: 1000 * 60 * 60 * 24 * config.session.maxAge// session max age in miliseconds
          }
        })
    )
    
    this.app.use(fileUpload({
        createParentPath: true,
        limits: { fileSize: 1048576, files: 5 },
        useTempFiles : true,
        tempFileDir : '/tmp/',
        safeFileNames: true,
        preserveExtension: true,
        abortOnLimit: true,
        parseNested: true
    }));
    
    this.app.use(bodyparser.json());
    this.app.use(bodyparser.urlencoded({ extended: true }));
    
    // sanitize request data
    this.app.use(xss());
    this.app.use(mongoSanitize());
    
    // api routes
    this.app.use('/api', router);
    
    // send back a 404 error for any unknown api request
    this.app.use((req, res, next) => {
      next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
    });
    
    // convert error to ApiError, if needed
    this.app.use(errorConverter);
    
    // handle error
    this.app.use(errorHandler);
  }
}

module.exports = App;