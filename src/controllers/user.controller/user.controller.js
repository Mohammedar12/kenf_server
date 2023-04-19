const User = require('../../models/user.model/user.model');
const Favorite = require('../../models/user.model/favorite.model');
const Product = require('../../models/products.model/products.model');
const UserGroup = require('../../models/user_role.model/user_role.model');
const logger = require('../../config/logger');
const fileService = require("../../services/file.service");
const ApiError = require('../../helpers/ApiError');
const Session = require('../../models/user.model/session.model');
const redisService = require('../../services/redis.service.js');
const pick = require('../../helpers/pick');
const convertObjectId = require('../../helpers/convertObjectId');
const bcrypt = require('bcryptjs');
const catchAsync = require('../../helpers/catchAsync');

const createUser = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name', 'email', 'password', 'phone', 'role']);
    try{
        const emailExists = await User.exists({email: body.email.toLowerCase() });
        if(emailExists){
            return res.status(400).json({
                status: 400,
                message: 'Email already exists',
            }); 
        }
        const phoneExists = await User.exists({phone: body.phone});
        if(phoneExists){
            return res.status(400).json({
                status: 400,
                message: 'Phone already exists',
            }); 
        }
        const saltRounds = 10;
        body.password = await bcrypt.hash(body.password, saltRounds);
        const user = await User.create(body);
        if(req.files?.profilePicture){
            const profilePictureUrl = _uploadProfilePicture(user.id,req.files.profilePicture);
            user.profilePicture = profilePictureUrl;
            await user.save();
        }
        delete user.password;
        delete user.confirmationCode;
        return res.status(200).json({
            status: 200,
            message: 'User created',
            data: user
        });  
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });  
    }
});

const updateUser = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name', 'email', 'password', 'phone', 'role', 'status']);
    const userId = req.params.id;
    try{
        const emailExists = await User.exists({ email: body.email.toLowerCase(), _id: { $ne: convertObjectId(userId) } });
        if(emailExists){
            return res.status(400).json({
                status: 400,
                message: 'Email already exists',
            }); 
        }
        const phoneExists = await User.exists({ phone, _id: { $ne: convertObjectId(userId) } });
        if(phoneExists){
            return res.status(400).json({
                status: 400,
                message: 'Phone already exists',
            }); 
        }

        let destroyAllSessions = false;;
        if(body.password !== undefined && body.password != ''){
            const saltRounds = 10;
            body.password = await bcrypt.hash(body.password, saltRounds);
        }
        if(body.role !== undefined || body.status !== undefined){
            const user = await User.findOne({ id: userId },'id status role');
            if(!user){
                return res.status(404).json({
                    status: 404,
                    message: 'User not found',
                });
            }
            if(user.status !== body.status || user.role !== body.role){
                destroyAllSessions = true;
            }
        }
        const update = await User.updateOne({ _id: convertObjectId(userId) },body);
        if(update.nModified == 0){
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }
        if(destroyAllSessions){
            const sessions = await Session.find({ user: userId },'id sessionId');
            if(sessions){
                let sessionStore = redisService.getSessionStore();
                for(let i=0;i<sessions.length;i++){
                    sessionStore.destroy(sessions[i].sessionId);
                }
                await Session.deleteOne({ user: userId });
            }
        }
        return res.status(200).json({
            status: 200,
            message: 'User updated',
        });
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });  
    }
});

const deleteUser = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findOne({ _id: convertObjectId(userId) },'id profilePicture');
    if(!user){
        return res.status(404).json({
            status: 404,
            message: 'User not found',
        });
    }
    const sessions = await Session.find({ user: userId },'id sessionId');
    if(sessions){
        let sessionStore = redisService.getSessionStore();
        for(let i=0;i<sessions.length;i++){
            sessionStore.destroy(sessions[i].sessionId);
        }
        await Session.deleteOne({ user: userId });
    }
    if(user.profilePicture){
        fileService.deleteFile(user.profilePicture);
    }
    await User.deleteOne({ _id: user.id });
    return res.status(200).json({
        status: 200,
        message: 'User deleted successfully.',
    });
});

const getUser = catchAsync(async (req, res, next) => {
    try{
        const user = await User.findOne({ _id: convertObjectId(req.params.id) },'id name email phone role status profilePicture');
        if(!user){
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'User found',
            data: user
        });
    }
    catch(e){
        return res.status(404).json({
            status: 404,
            message: 'User not found',
        });
    }
});
    
const getUserList = catchAsync(async (req, res, next) => {
    const filter = pick(req.query, ['search', 'role']);
    const options = pick(req.query, ['sort', 'limit', 'page']);
    if(filter.search && search.search !== ''){
        filter["$text"] = {$search: filter.search};
        delete filter.search;
    }
    if(!options.sort || options.sort === ''){
        options.sort = "-createdAt";
    }
    options.select = "id name email phone role status profilePicture createdAt";
    const result = await User.paginate(filter, options);
    return res.status(200).json({
        status: 200,
        message: '',
        data: result
    });
});

const getProfile = catchAsync(async (req, res, next) => {
    try{
        const user = await User.findOne({ _id: convertObjectId(req.user.id) },'id name email phone role status profilePicture loginType address billingAddress');
        if(!user){
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: '',
            data: user
        });
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });  
    }
});

const updateProfile = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ _id: convertObjectId(req.user.id) },'id name email phone address billingAddress loginType');
    if(!user){
        return res.status(404).json({
            status: 404,
            message: 'User not found',
        });
    }
    const body = pick(req.body, ['name', 'address', 'billingAddress','email' ,'phone']);
    if(body.email && ( !user.email || user.email === '' ) && loginType !== 'email'){
        user.email = body.email;
    }
    if(body.phone && ( !user.phone || user.phone === '' ) && loginType !== 'phone'){
        user.phone = body.phone;
    }
    user.name = body.name;
    user.address = body.address;
    user.billingAddress = body.billingAddress;
    await user.save();
    return res.status(200).json({
        status: 200,
        message: 'Profile updated.',
        data: user
    });
});

const uploadProfilePicture = catchAsync(async (req, res, next) => {
    if(!req.files?.profilePicture){
        return res.status(400).json({
            status: 400,
            message: 'profilePicture is required',
        }); 
    }
    try{
        const user = await User.findOne({ id: req.user.id },'id profilePicture');
        const profilePictureUrl = _uploadProfilePicture(user.id,req.files.profilePicture);
        user.profilePicture = profilePictureUrl;
        await user.save();
        return res.status(200).json({
            status: 200,
            message: 'Profile picture uploaded',
            data: { profilePictureUrl: user.profilePicture }
        });  
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });  
    }
});

const getCart = catchAsync(async(req,res,next) => {
    let cartItems = [];
    let user;
    if(req.session.user){
        user = await User.findOne({ _id: convertObjectId(req.session.user.id), status: true },'id cart');
        if(!user){
            return res.status(401).json({
                status: 401,
                message: 'Unauthorized'
            });  
        }
        cartItems = user.cart;
        if(!cartItems){
            cartItems = [];
        }
    } else if(req.session.cart){
        cartItems = req.session.cart;
        if(!cartItems){
            cartItems = [];
        }
    }
    if(cartItems.length != 0){
        const product_ids = [];
        const product_cart_mapping = [];
        for(let i=0;i<cartItems.length;i++){
            product_ids[i] = convertObjectId(cartItems[i].id);
            product_cart_mapping[cartItems[i].id] = cartItems[i];
        }
        const products = await Product.find({ _id: { $in: product_ids }, active: true },{ id: 1, name_en: 1, name_ar: 1, extra_price: 1, images: { $first: "$images" }, mainImage: 1, ringSize: 1}).populate([ { path: 'images', select: 'id link'}, { path: 'mainImage', select: 'id link'}, { path: 'ringSize', select: 'name_en name_ar unit', match: { active: true } } ]);
        if(products.length !== product_ids.length){
            cartItems = [];
            for(let i=0;i<products.length;i++){
                cartItems[i]= {
                    id: products[i].id,
                    quantity: product_cart_mapping[products[i].id].quantity
                }
            }
            if(user){
                user.cart = cartItems;
                await user.save();
            }
            else{
                req.session.cart = cartItems;
            }
        }
        for(let i=0;i<products.length;i++){
            products[i] = products[i].toJSON();
            products[i].quantity = product_cart_mapping[products[i].id].quantity;
        }
        cartItems = products;
    }
    return res.status(200).json({
        status: 200,
        message: '',
        data: cartItems
    }); 
});

const updateCart = catchAsync(async(req, res, next) => {
    const products = req.body.products;
    try{
        const productIds = [];
        for(let i=0;i<products.length;i++){
            productIds[i] = convertObjectId(products[i].id);
        }
        const productCount = await Product.find({ _id: { $in: productIds }, active: true }).countDocuments();
        if(productCount < products.length){
            return res.status(400).json({
                status: 400,
                message: 'Product not found'
            });  
        }
        let cart;
        let user;
        if(!req.session.user){
            cart = req.session.cart;
            if(!cart){
                cart = [];
            }
            for(let i=0;i<cart.length;i++){
                cart[i].id = convertObjectId(cart[i].id);
            }
        }
        else{
            user = await User.findOne({ _id: convertObjectId(req.session.user.id) },'id cart');
            if(!user){
                return res.status(401).json({
                    status: 401,
                    message: 'Unauthorized'
                });  
            }
            cart = user.cart;
            if(!cart){
                cart = [];
            }
        }
        for(let i=0;i<products.length;i++){
            let productExitsInCart = false;
            for(let j=0;j<cart.length;j++){
                if(convertObjectId(products[i].id).equals(cart[j].id)){
                    productExitsInCart = true;
                    if(products[i].quantity === 0){
                        cart.splice(j,1); 
                    }
                    else{
                        cart[j] = products[i];
                    }
                    break;
                }
            }
            if(!productExitsInCart && products[i].quantity !== 0){
                cart.push(products[i]);
            }
        }
        if(!req.session.user){
            req.session.cart = cart;
        }
        else{
            user.cart = cart;
            await user.save();
        }
        return res.status(200).json({
            status: 200,
            message: 'Cart updated successfully.',
            data: cart
        }); 
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        }); 
    }
});

const addToCartFromFavorites = catchAsync(async(req, res, next) => {
    try{
        let favorites = await Favorite.find({ user: convertObjectId(req.user.id) },'product user').populate([{
            path: 'product',
            match: { active: true, quantity: { $gt: 0 } },
            select: 'id'
        }]);
        if(!favorites){
            favorites = [];
        }   
        let user = await User.findOne({ _id: convertObjectId(req.session.user.id) },'id cart');
        if(!user){
            return res.status(401).json({
                status: 401,
                message: 'Unauthorized'
            });  
        }
        cart = user.cart;
        if(!cart){
            cart = [];
        }
        for(let i=0;i<favorites.length;i++){
            if(favorites[i]?.product){
                let productExitsInCart = false;
                for(let j=0;j<cart.length;j++){
                    if(convertObjectId(favorites[i].product.id).equals(cart[j].id)){
                        productExitsInCart = true;
                        break;
                    }
                }
                if(!productExitsInCart){
                    cart.push({
                        id: favorites[i].product.id,
                        quantity: 1
                    });
                }
            }
        }
        user.cart = cart;
        await user.save();
        return res.status(200).json({
            status: 200,
            message: 'Cart updated successfully.',
            data: cart
        }); 
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        }); 
    }
});

const clearCart = catchAsync(async(req, res, next) => {
    try{
        if(!req.session.user){
            req.session.cart = [];
        }
        else{
            user = await User.findOne({ _id: convertObjectId(req.session.user.id) },'id cart');
            if(!user){
                return res.status(401).json({
                    status: 401,
                    message: 'Unauthorized'
                });  
            }
            user.cart = [];
            await user.save();
        }
        return res.status(200).json({
            status: 200,
            message: 'Cart cleared successfully.',
        }); 
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        }); 
    }
});

const addToFavorite = catchAsync(async(req, res, next) => {
    const productId = req.body.productId;
    const userId = req.user.id;
    try{
        const productExists = await Product.exists({ _id: convertObjectId(productId), active: true });
        if(!productExists){
            return res.status(400).json({
                status: 400,
                message: 'Product not found'
            }); 
        }
        const favoriteExists = await Favorite.exists({ user: userId, product: productId });
        if(!favoriteExists){
            let favorite = await Favorite.create({ user: userId, product: productId });
        }
        return res.status(200).json({
            status: 200,
            message: 'Added to favorite'
        }); 
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        }); 
    }
});


const removeFromFavorite = catchAsync(async(req, res, next) => {
    const productId = req.params.id;
    const userId = req.user.id;
    try{
        const deleted = await Favorite.deleteOne({ product: productId, user: userId });
        return res.status(200).json({
            status: 200,
            message: 'removed from favorite'
        }); 
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        }); 
    }
});

const getFavoriteList = catchAsync(async (req, res, next) => {
    const filter = { user: convertObjectId(req.user.id) };
    const options = pick(req.query, ['limit', 'page']);
    options.sort = "-createdAt";
    options.select = "product";
    options.populate = {
        path: "product",
        select: {id: 1, name_en: 1, name_ar: 1, outofStock: { $cond: { if: { '$lte': ['$quantity',0] }, then: true, else: false } } , extra_price: 1, images: { $first: "$images" }, mainImage: 1},
        match: { active: true, hidden: false },
        populate: [
            { path: 'images', select: 'id link' },
            { path: 'mainImage', select: 'id link' }
        ]
    };
    const result = await Favorite.paginate(filter, options);
    return res.status(200).json({
        status: 200,
        message: '',
        data: result
    });
});

const removeAllFavorite = catchAsync(async(req, res, next) => {
    try{
        const deleted = await Favorite.deleteMany({ user: convertObjectId(req.user.id) });
        return res.status(200).json({
            status: 200,
            message: 'removed from favorite'
        }); 
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        }); 
    }
});


/***************   User Group    **************** */
const createUserGroup = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_ar', 'name_en', 'permissions', 'active']);
    try{
        const userGroup = await UserGroup.create(body);
        return res.status(200).json({
            status: 200,
            message: 'User Group created',
            data: userGroup
        });  
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });  
    }
});

const updateUserGroup = catchAsync(async (req, res, next) => {
    const body = pick(req.body, ['name_ar', 'name_en', 'permissions', 'active']);
    const userGroupId = req.params.id;
    try{
        const update = await UserGroup.updateOne({ _id: convertObjectId(userGroupId) },body);
        if(update.nModified == 0){
            return res.status(404).json({
                status: 404,
                message: 'User Group not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'User Group updated',
        });
    }
    catch(e){
        logger.error(e);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });  
    }
});

const deleteUserGroup = catchAsync(async (req, res, next) => {
    const userGroupId = req.params.id;
    const userGroup = await UserGroup.findOne({ _id: convertObjectId(userGroupId) },'id');
    if(!userGroup){
        return res.status(404).json({
            status: 404,
            message: 'User Group not found',
        });
    }
    await UserGroup.deleteOne({ _id: userGroup.id });
    return res.status(200).json({
        status: 200,
        message: 'User Group deleted successfully.',
    });
});

const getUserGroupList = catchAsync(async (req, res, next) => {
    const filter = {};
    const options = pick(req.query, ['sort', 'limit', 'page']);
    if(!options.sort || options.sort === ''){
        options.sort = "-createdAt";
    }
    options.select = "_id name_ar name_en active";
    const result = await UserGroup.paginate(filter, options);
    return res.status(200).json({
        status: 200,
        message: '',
        data: result
    });
});

const getUserGroup = catchAsync(async (req, res, next) => {
    try{
        const userGroup = await UserGroup.findOne({ _id: convertObjectId(req.params.id) },'_id name_ar name_en permissions active');
        if(!userGroup){
            return res.status(404).json({
                status: 404,
                message: 'User Group not found',
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'User Group found',
            data: userGroup
        });
    }
    catch(e){
        return res.status(404).json({
            status: 404,
            message: 'User Group not found',
        });
    }
});
/********************************************* */

const _uploadProfilePicture = (userId, file) => {
    const allowed_file_mime = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    const allowed_file_ext = ['png', 'jpeg', 'jpg', 'gif'];

    const file_extension = file.name.slice(
        ((file.name.lastIndexOf('.') - 1) >>> 0) + 2
    );

    if (!allowed_file_ext.includes(file_extension)) {
        throw new ApiError(400,"Invalid file");
    }

    if (!allowed_file_mime.includes(file.mimetype)) {
        throw new ApiError(400,"Invalid file");
    }
    return fileService.saveFile(file,'profilePicture.jpg','private',userId);
};

module.exports = {
    createUser,
    uploadProfilePicture,
    updateUser,
    deleteUser,
    getUser,
    getProfile,
    getUserList,
    updateCart,
    clearCart,
    createUserGroup,
    updateUserGroup,
    deleteUserGroup,
    getUserGroupList,
    getUserGroup,
    updateProfile,
    addToFavorite,
    removeFromFavorite,
    getFavoriteList,
    getCart,
    removeAllFavorite,
    addToCartFromFavorites,
}