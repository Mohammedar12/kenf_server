const mongoose = require('mongoose');
const App = require('./app.js');
const config = require('./config/config.js');
const logger = require('./config/logger.js');
const redisService = require('./services/redis.service.js');

let server;
let app;

mongoose.connect(config.mongoose.url, config.mongoose.options).then(async() => {
// mongoose.connect("mongodb+srv://kenf:kenf1986@cluster0.eddwzcb.mongodb.net/test").then(async() => {
  logger.info('Connected to MongoDB');
  let connected = await redisService.initialize();
  if(connected){
    app = new App(); 
    server = app.startApp();
  }
}).catch((err)=>{
  logger.error("Database connection error");
  logger.error(err);
}); 

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
