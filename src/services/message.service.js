const axios = require('axios');
const config = require('../config/config');
const logger = require('../config/logger');

const sendsms = async (phone, message) => {
  try{
    let smsResponse = await axios({
      method: 'post',
      url: 'https://api.taqnyat.sa/v1/messages',
      data: {
        recipients: phone,
        sender: config.sms.sender,
        body: message
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+ config.sms.auth
      }
    });
    return smsResponse;
  }
  catch(e){
    logger.error(e);
    return false;
  }
  
}

module.exports = {
  sendsms
};
