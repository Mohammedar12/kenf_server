const express = require("express");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/auth");
const settingsValidation = require("../../validations/settings.validation");
const settingsController = require("../../controllers/settings.controller/settings.controller");

const router = express.Router();

/**************    Shipping   ******************* */
router
  .route("/shipping")
  .get(
    auth("admin", true),
    validate(settingsValidation.getShippingList),
    settingsController.getShippingList
  )
  .post(
    auth("admin"),
    validate(settingsValidation.createShipping),
    settingsController.createShipping
  );

router
  .route("/shipping/:id")
  .put(
    auth("admin"),
    validate(settingsValidation.updateShipping),
    settingsController.updateShipping
  )
  .delete(
    auth("admin"),
    validate(settingsValidation.shippingId),
    settingsController.deleteShipping
  );
/************************************************ */

/**************    ItemSize   ******************* */
router
  .route("/items_size")
  .get(
    auth("admin"),
    validate(settingsValidation.getItemSizeList),
    settingsController.getItemSizeList
  )
  .post(
    auth("admin"),
    validate(settingsValidation.createItemSize),
    settingsController.createItemSize
  );

router
  .route("/items_size/:id")
  .put(
    auth("admin"),
    validate(settingsValidation.updateItemSize),
    settingsController.updateItemSize
  )
  .delete(
    auth("admin"),
    validate(settingsValidation.itemSizeId),
    settingsController.deleteItemSize
  );
/************************************************ */

/**************    ItemGroup   ******************* */
router
  .route("/items_group")
  .get(
    auth("admin", true),
    validate(settingsValidation.getItemGroupList),
    settingsController.getItemGroupList
  )
  .post(
    auth("admin"),
    validate(settingsValidation.createItemGroup),
    settingsController.createItemGroup
  );

router
  .route("/items_group/:id")
  .get(
    auth("admin", true),
    validate(settingsValidation.itemGroupId),
    settingsController.getItemGroup
  )
  .put(
    auth("admin"),
    validate(settingsValidation.updateItemGroup),
    settingsController.updateItemGroup
  )
  .delete(
    auth("admin"),
    validate(settingsValidation.itemGroupId),
    settingsController.deleteItemGroup
  );
/************************************************ */

/**************    ItemCategory   ******************* */
router
  .route("/items_category")
  .get(
    auth("admin", true),
    validate(settingsValidation.getItemCategoryList),
    settingsController.getItemCategoryList
  )
  .post(
    auth("admin"),
    validate(settingsValidation.createItemCategory),
    settingsController.createItemCategory
  );

router
  .route("/items_category/:cat_id/:group_id?")
  .get(
    auth("admin", true),
    validate(settingsValidation.getCategoryHeroProduct),
    settingsController.getItemCategory
  );

router
  .route("/items_category/:id")
  .put(
    auth("admin"),
    validate(settingsValidation.updateItemCategory),
    settingsController.updateItemCategory
  )
  .delete(
    auth("admin"),
    validate(settingsValidation.itemCategoryId),
    settingsController.deleteItemCategory
  );
/************************************************ */

/**************    Brand   ******************* */

router
  .route("/brands")
  .get(
    auth("admin", true),
    validate(settingsValidation.getBrandList),
    settingsController.getBrandList
  )
  .post(
    auth("admin"),
    validate(settingsValidation.createBrand),
    settingsController.createBrand
  );

router
  .route("/brands/:id")
  .get(
    auth("admin"),
    validate(settingsValidation.BrandId),
    settingsController.getBrand
  )
  .put(
    auth("admin"),
    validate(settingsValidation.updateBrand),
    settingsController.updateBrand
  )
  .delete(
    auth("admin"),
    validate(settingsValidation.BrandId),
    settingsController.deleteBrand
  );
/************************************************ */

/**************    Purity   ******************* */
router
  .route("/purity")
  .get(
    auth("admin", true),
    validate(settingsValidation.getPurityList),
    settingsController.getPurityList
  )
  .post(
    auth("admin"),
    validate(settingsValidation.createPurity),
    settingsController.createPurity
  );

router
  .route("/purity/:id")
  .put(
    auth("admin"),
    validate(settingsValidation.updatePurity),
    settingsController.updatePurity
  )
  .delete(
    auth("admin"),
    validate(settingsValidation.purityId),
    settingsController.deletePurity
  );
/************************************************ */

/**************    OrderStatus   ******************* */
router
  .route("/order_status")
  .get(
    auth("admin"),
    validate(settingsValidation.getOrderStatusList),
    settingsController.getOrderStatusList
  )
  .post(
    auth("admin"),
    validate(settingsValidation.createOrderStatus),
    settingsController.createOrderStatus
  );

router
  .route("/order_status/:id")
  .put(
    auth("admin"),
    validate(settingsValidation.updateOrderStatus),
    settingsController.updateOrderStatus
  )
  .delete(
    auth("admin"),
    validate(settingsValidation.orderStatusId),
    settingsController.deleteOrderStatus
  );
/************************************************ */

/**************    Unit   ******************* */
router
  .route("/units")
  .get(
    auth("admin"),
    validate(settingsValidation.getUnitList),
    settingsController.getUnitList
  )
  .post(
    auth("admin"),
    validate(settingsValidation.createUnit),
    settingsController.createUnit
  );

router
  .route("/units/:id")
  .put(
    auth("admin"),
    validate(settingsValidation.updateUnit),
    settingsController.updateUnit
  )
  .delete(
    auth("admin"),
    validate(settingsValidation.unitId),
    settingsController.deleteUnit
  );
/************************************************ */

/**************    Payment Method   ******************* */
router
  .route("/pm")
  .get(
    auth("admin"),
    validate(settingsValidation.getPaymentMethodList),
    settingsController.getPaymentMethodList
  )
  .post(
    auth("admin"),
    validate(settingsValidation.createPaymentMethod),
    settingsController.createPaymentMethod
  );

router
  .route("/pm/:id")
  .put(
    auth("admin"),
    validate(settingsValidation.updatePaymentMethod),
    settingsController.updatePaymentMethod
  )
  .delete(
    auth("admin"),
    validate(settingsValidation.paymentMethodId),
    settingsController.deletePaymentMethod
  );
/************************************************ */

/**************    Complaints   ******************* */
router
  .route("/complaints")
  .get(
    auth(),
    validate(settingsValidation.getComplaintList),
    settingsController.getComplaintList
  )
  .post(
    auth(),
    validate(settingsValidation.createComplaint),
    settingsController.createComplaint
  );

router
  .route("/complaints/answer/:id")
  .put(
    auth("admin"),
    validate(settingsValidation.answerComplaint),
    settingsController.answerComplaint
  );

router
  .route("/complaints/:id")
  .delete(
    auth("admin"),
    validate(settingsValidation.complaintId),
    settingsController.deleteComplaint
  );
/************************************************ */

/**************    SystemInfo   ******************* */
router
  .route("/sys_info")
  .get(auth("admin"), settingsController.getSystemInfo)
  .post(
    auth("admin"),
    validate(settingsValidation.updateSystemInfo),
    settingsController.updateSystemInfo
  );
/************************************************ */

module.exports = router;
