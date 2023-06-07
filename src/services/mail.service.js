const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const redisService = require('../services/redis.service');
const handlebars = require('handlebars');
const fs = require('fs/promises');

const transporter = nodemailer.createTransport({
    pool: true,
    service: config.email.smtp.service,
    auth: {
        user: config.email.smtp.auth.user,
        pass: config.email.smtp.auth.pass,
    }
});


const readHTMLFile = async(path) => {
    try{
        let html = await fs.readFile(path, { encoding: 'utf-8' });
        return html;
    }
    catch(e){
        logger.error(e);
        return false;
    }
};

const sendEmail = async(targetMail, subject, text, isHtml) => {
    let mailOptions = {
        from: config.email.from,
        to: targetMail,
        subject: subject,
    };
    if(isHtml){
        mailOptions.html = text;
    }
    else{
        mailOptions.text = text;
    }
    let response = false;
    try{
        response = await transporter.sendMail(mailOptions);
    }
    catch(e){
        logger.error(e);
    }
    return response;
}

const sendSendTemplateMail = async(targetMail, subject, templatePath, replacements) => {
    let redisEmailContentKey = "kenf_" + templatePath;
    let html = await redisService.getData(redisEmailContentKey);
    if(!html || html === ''){
        html = await readHTMLFile(templatePath);
        if(!html){
            return false;
        }
        redisService.setData(redisEmailContentKey,html);
    }
    let template = handlebars.compile(html);
    let htmlToSend = template(replacements);
    return await sendEmail(targetMail,subject,htmlToSend,true);
}

module.exports = {
    sendEmail,
    sendSendTemplateMail,
}