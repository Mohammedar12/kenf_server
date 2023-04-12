const config = require('../config/config');
const logger = require('../config/logger');
const {createClient} = require('redis');
const RedisStore = require('connect-redis').default;

let _redisClient;
let _sessionStore;

const initialize = async() => {
    try{
        _redisClient = createClient({
            url: config.redis?.url || 'redis://localhost:6379',
            disableOfflineQueue: true,
        });
        await _redisClient.connect();
        _sessionStore = new RedisStore({
            client: _redisClient,
            prefix: config.redis.prefix,
        })
        logger.info('Connected to Redis');
        return true;
    }
    catch(e){
        logger.error("Redis connection error");
        logger.error(e);
        return false;
    }
};

const getClient = () => {
    return _redisClient;
};

const getSessionStore = () => {
    return _sessionStore;
};

const getData = async(key) => {
    return await _redisClient.get(key);
};

const setData = async(key,value) => {
    return await _redisClient.set(key,value);
};

module.exports = {
    initialize,
    getClient,
    getSessionStore,
    getData,
    setData,
}