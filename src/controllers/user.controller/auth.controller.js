const User = require('../../models/user.model/user.model');
const Session = require('../../models/user.model/session.model');
const { sendsms } = require('../../services/message.service');
const { sendSendTemplateMail } = require('../../services/mail.service');
const bcrypt = require('bcryptjs');
const logger = require('../../config/logger');
const config = require('../../config/config');
const catchAsync = require('../../helpers/catchAsync');


const signinSendMailOtp = catchAsync(async (req, res, next) => {
    const email = req.body.email;
    const confirmCode = Math.floor(1000 + Math.random() * 9000);

    if(req.session?.user){
        return res.status(400).json({
            status: 400,
            message: 'You are already authenticated',
        });
    }

    try{
        let user = await User.findOne({ email: email }, 'id email confirmationCode');
        if(!user){
            user = await User.create({
                email: email,
                confirmationCode: {
                    code: confirmCode,
                    codeType: 'Email',
                    createdAt: new Date(),
                }
            });
        }
        else{
            if(user.confirmationCode){
                user.confirmationCode.code = confirmCode;
                user.confirmationCode.codeType = 'Email';
                user.confirmationCode.createdAt = new Date();
            }
            else{
                user.confirmationCode = {
                    code: confirmCode,
                    codeType: 'Email',
                    createdAt: new Date(),
                };
            }
            await user.save();
        }
        let mailResponse = await sendSendTemplateMail(email, 'Verify Email', __dirname + '/../index.html',  { usercode: confirmCode });
        if(!mailResponse){
            return res.status(500).send({
                status: 500,
                message: "Internal server error, couldn't send email"
            });
        }
        return res.status(200).send({
            status: 200,
            message: 'sent code.',
        });
    }
    catch(e){
        logger.error(e);
        return res.status(500).send({
            status: 500,
            message: "Internal server error"
        });
    }
});

const signinSendMobileOtp = catchAsync(async (req, res, next) => {
    const phone = req.body.phone;
    const confirmCode = Math.floor(1000 + Math.random() * 9000);

    if(req.session?.user){
        return res.status(400).json({
            status: 400,
            message: 'You are already authenticated',
        });
    }

    try{
        let user = await User.findOne({ phone: phone }, 'id phone confirmationCode');
        if(!user){
            user = await User.create({
                phone: phone,
                confirmationCode: {
                    code: confirmCode,
                    codeType: 'Phone',
                    createdAt: new Date(),
                }
            });
        }
        else{
            if(user.confirmationCode){
                user.confirmationCode.code = confirmCode;
                user.confirmationCode.codeType = 'Phone';
                user.confirmationCode.createdAt = new Date();
            }
            else{
                user.confirmationCode = {
                    code: confirmCode,
                    codeType: 'Phone',
                    createdAt: new Date(),
                };
            }
            await user.save();
        }

        let smsResponse = await sendsms(phone,confirmCode +" is your OTP for KENF");

        if(!smsResponse){
            return res.status(500).send({
                status: 500,
                message: "Couldn't send SMS"
            });
        }

        return res.status(200).send({
            status: 200,
            message: 'sent code.',
        });
    }
    catch(e){
        logger.error(e);
        return res.status(500).send({
            status: 500,
            message: error
        });
    }
});

const signInWithOtp = catchAsync(async (req, res, next) => {
    const type = req.body.type;
    const otp = req.body.otp;
    let email = req.body.email;
    const phone = req.body.phone;

    if(email){
        email = email.toLowerCase();
    }

    if(req.session?.user){
        return res.status(400).json({
            status: 400,
            message: 'You are already authenticated',
        });
    }

    let user;
    let productsInSessionCart = '';
    if(req.session.cart && Array.isArray(req.session.cart) && req.session.cart.length !== 0){
        productsInSessionCart = 'cart';
    }
    if(type==='phone'){
        user = await User.findOne({ phone: phone },'id email phone confirmationCode role status '+productsInSessionCart);
    }
    else{
        user = await User.findOne({ email: email },'id email phone confirmationCode role status '+productsInSessionCart);
    }

    if(!user){
        //return error invalid email/phone or otp
        return res.status(401).json({
            status: 401,
            message: 'Wrong OTP'
        });    
    }
    if(type === 'phone' && user.confirmationCode?.codeType !== 'Phone'){
        //return error invalid email/phone or otp
        return res.status(401).json({
            status: 401,
            message: 'Wrong OTP'
        });    
    }
    if(type === 'email' && user.confirmationCode?.codeType !== 'Email'){
        //return error invalid email/phone or otp
        return res.status(401).json({
            status: 401,
            message: 'Wrong OTP'
        });    
    }
    if(user.confirmationCode.code !== otp){
        //return error invalid email/phone or otp
        return res.status(401).json({
            status: 401,
            message: 'Wrong OTP'
        });    
    }
    const diffTime = (Math.abs(new Date() - user.confirmationCode.createdAt))/1000;
    if(diffTime > (5 * 60)){
        //return error invalid otp expired
        return res.status(401).json({
            status: 401,
            message: 'OTP is expired'
        });    
    }
    if(!user.status){
        return res.status(403).json({
            status: 403,
            message: 'Your account is disabled'
        });   
    }
    let expiry = new Date();
    expiry.setDate(expiry.getDate() + config.session.maxAge );

    await Session.create({
        sessionId: req.session.id,
        user: user.id,
        expireAt: expiry
    })
    
    if(productsInSessionCart === 'cart'){
        let cart = user.cart;
        if(!cart){
            cart = [];
        }
        const sessionCart = req.session.cart;
        for(let i=0;i<sessionCart.length;i++){
            let productExitsInCart = false;
            for(let j=0;j<cart.length;j++){
                if(sessionCart[i].id === cart[j].id){
                    productExitsInCart = true;
                    cart[j] = sessionCart[i];
                    break;
                }
            }
            if(!productExitsInCart){
                cart.push(sessionCart[i]);
            }
        }
        user.cart = cart;
        await user.save();
    }
    req.session.cart = undefined;
    req.session.user = {
        id: user.id,
        role: user.role,
        email: user.email,
        phone: user.phone
    };
    user.loginType = type;
    user.confirmationCode = undefined;
    await user.save();


    return res.status(200).json({
        status: 200,
        message: 'Logged in successfully',
        data: {
            id: user.id,
            role: user.role,
            email: user.email,
            phone: user.phone
        }
    });

});

const signInWithPasswordAdmin = catchAsync(async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if(req.session?.user){
        return res.status(400).json({
            status: 400,
            message: 'You are already authenticated',
        });
    }

    let user = await User.findOne({ email: email },'id name role email phone password status');
    if(!user || !user.password || user.password  === ''){
        return res.status(401).json({
            status: 401,
            message: 'Email or password is invalid'
        });  
    }
    try{
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(401).json({
                status: 401,
                message: 'Email or password is invalid'
            });  
        }
        if(user.role !== 'admin'){
            return res.status(403).json({
                status: 403,
                message: 'Forbidden access.'
            });  
        }
        if(!user.status){
            return res.status(403).json({
                status: 403,
                message: 'Your account is disabled'
            });   
        }
        let expiry = new Date();
        expiry.setDate(expiry.getDate() + config.session.maxAge );
        await Session.create({
            sessionId: req.session.id,
            user: user.id,
            expireAt: expiry
        })
        req.session.user = {
            id: user.id,
            role: user.role,
            email: user.email,
            phone: user.phone
        };
        return res.status(200).json({
            status: 200,
            message: 'Logged in successfully',
            data: {
                id: user.id,
                role: user.role,
                email: user.email,
                phone: user.phone
            }
        });  
    }
    catch(e){
        logger.error(e);
        return res.status(401).json({
            status: 401,
            message: 'Email or password is invalid'
        });  
    }
});

const logout = catchAsync(async (req, res, next) => {
    if(req.session){
        if(req.session.id){
            await Session.deleteOne({ sessionId: req.session.id });
        }
        req.session.destroy();
    }
    return res.status(200).json({
        status: 200,
        message: 'Logged out successfully'
    });  
});


module.exports = {
    signinSendMailOtp,
    signinSendMobileOtp,
    signInWithOtp,
    signInWithPasswordAdmin,
    logout
}