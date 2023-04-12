const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller/user.controller');

const router = express.Router()

router.route('/')
    .get(auth('admin'), validate(userValidation.getUserList), userController.getUserList)
    .post(auth('admin'), validate(userValidation.createUser), userController.createUser);

router.route('/profile')
    .get(auth(), userController.getProfile)
    .put(auth(), validate(userValidation.updateProfile), userController.updateProfile);

router.post('/profile/profilePicture', auth(), userController.uploadProfilePicture);

router.route('/cart')
    .get(auth('admin',true),userController.getCart)
    .post(validate(userValidation.updateCart),userController.updateCart)
    .delete(userController.clearCart);

router.route('/cart/import_from_favorites').post(auth(),userController.addToCartFromFavorites);

router.route('/favorite')
    .get(auth(), validate(userValidation.getFavoriteList),userController.getFavoriteList)
    .post(auth(), validate(userValidation.addToFavorite),userController.addToFavorite)

router.route('/favorite/all').delete(auth(), userController.removeAllFavorite);
router.route('/favorite/:id').delete(auth(),validate(userValidation.favoriteDelete) , userController.removeFromFavorite);

router.route('/group')
    .get(auth('admin'),validate(userValidation.getUserGroupList), userController.getUserGroupList)
    .post(auth('admin'),validate(userValidation.createUserGroup), userController.createUserGroup);

router.route('/group/:id')
    .get(auth('admin'), validate(userValidation.groupId), userController.getUserGroup)
    .delete(auth('admin'), validate(userValidation.groupId),userController.deleteUserGroup)
    .put(auth('admin'), validate(userValidation.updateUserGroup), userController.updateUserGroup);

router.route('/:id')
    .get(auth('admin'), validate(userValidation.userId), userController.getUser)
    .put(auth('admin'), validate(userValidation.updateUser), userController.updateUser)
    .delete(auth('admin'), validate(userValidation.userId), userController.deleteUser);

module.exports = router;