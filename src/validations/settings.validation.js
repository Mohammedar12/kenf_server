const Joi = require("joi");
const { password, objectId } = require("./custom.validation");

/**************    Shipping   ******************* */
const shippingId = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};
const createShipping = {
  body: Joi.object().keys({
    company: Joi.string().trim().min(2).max(255).required(),
    price: Joi.number().min(0).required(),
    time: Joi.string().trim().min(1).max(255).required(),
  }),
};

const updateShipping = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    company: Joi.string().trim().min(2).max(255),
    price: Joi.number().min(0),
    time: Joi.string().trim().min(1).max(255),
  }),
};

const getShippingList = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(5).max(100),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid(
      "createdAt",
      "-createdAt",
      "company",
      "-company",
      "price",
      "-price",
      "time",
      "-time"
    ),
  }),
};
/************************************************ */

/**************    ItemSize   ******************* */
const itemSizeId = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};
const createItemSize = {
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255).required(),
    name_ar: Joi.string().trim().min(2).max(255).required(),
    unit: Joi.string().trim().min(1).max(100).required(),
    active: Joi.boolean(),
  }),
};

const updateItemSize = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255),
    name_ar: Joi.string().trim().min(2).max(255),
    unit: Joi.string().trim().min(1).max(100),
    active: Joi.boolean(),
  }),
};

const getItemSizeList = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(5).max(100),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid(
      "createdAt",
      "-createdAt",
      "name_en",
      "-name_en",
      "name_ar",
      "-name_ar",
      "unit",
      "-unit"
    ),
  }),
};
/************************************************ */

/**************    ItemGroup   ******************* */
const itemGroupId = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
};
const createItemGroup = {
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255).required(),
    name_ar: Joi.string().trim().min(2).max(255).required(),
    abbreviation: Joi.string().trim().min(1).max(255).required(),
    active: Joi.boolean(),
    images: Joi.array()
      .items(Joi.string().custom(objectId))
      .min(1)
      .max(10)
      .required(), // hide it for test
  }),
};

const updateItemGroup = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255),
    name_ar: Joi.string().trim().min(2).max(255),
    abbreviation: Joi.string().trim().min(1).max(255),
    active: Joi.boolean(),
    images: Joi.array().items(Joi.string().custom(objectId)).min(1).max(10),
  }),
};

const getItemGroupList = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(5).max(100),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid(
      "createdAt",
      "-createdAt",
      "name_en",
      "-name_en",
      "name_ar",
      "-name_ar",
      "abbreviation",
      "-abbreviation"
    ),
  }),
};
/************************************************ */

/**************    ItemCategory   ******************* */
const itemCategoryId = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};
const createItemCategory = {
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255).required(),
    name_ar: Joi.string().trim().min(2).max(255).required(),
    abbreviation: Joi.string().trim().min(1).max(255).required(),
    isKenf: Joi.boolean().required(),
    active: Joi.boolean(),
    images: Joi.array()
      .items(Joi.string().custom(objectId))
      .min(1)
      .max(10)
      .required(),
  }),
};

const updateItemCategory = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255),
    name_ar: Joi.string().trim().min(2).max(255),
    abbreviation: Joi.string().trim().min(1).max(255),
    isKenf: Joi.boolean(),
    active: Joi.boolean(),
    images: Joi.array().items(Joi.string().custom(objectId)).min(1).max(10),
  }),
};

const getItemCategoryList = {
  query: Joi.object().keys({
    isKenf: Joi.boolean(),
    limit: Joi.number().integer().min(5).max(100),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid(
      "createdAt",
      "-createdAt",
      "name_en",
      "-name_en",
      "name_ar",
      "-name_ar",
      "kenf_collection",
      "-kenf_collection",
      "abbreviation",
      "-abbreviation",
      "isKenf",
      "-isKenf"
    ),
  }),
};

const getCategoryHeroProduct = {
  params: Joi.object().keys({
    cat_id: Joi.string().required().custom(objectId),
    group_id: Joi.string().custom(objectId),
  }),
};
/************************************************ */

/**************    Brand   ******************* */

const BrandId = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};

const createBrand = {
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255).required(),
    name_ar: Joi.string().trim().min(2).max(255).required(),
    active: Joi.boolean(),
    images: Joi.array().items(Joi.string().custom(objectId)).min(1).max(10).required()
  }),
};

const updateBrand = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255),
    name_ar: Joi.string().trim().min(2).max(255),
    active: Joi.boolean(),
    images: Joi.array().items(Joi.string().custom(objectId)).min(1).max(10),
  }),
};

const getBrandList = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(5).max(100),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid(
      "createdAt",
      "-createdAt",
      "name_en",
      "-name_en",
      "name_ar",
      "-name_ar"
    ),
  }),
};

/************************************************ */

/**************    Purity   ******************* */
const purityId = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};
const createPurity = {
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255).required(),
    name_ar: Joi.string().trim().min(2).max(255).required(),
    active: Joi.boolean(),
  }),
};

const updatePurity = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255),
    name_ar: Joi.string().trim().min(2).max(255),
    active: Joi.boolean(),
  }),
};

const getPurityList = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(5).max(100),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid(
      "createdAt",
      "-createdAt",
      "name_en",
      "-name_en",
      "name_ar",
      "-name_ar"
    ),
  }),
};
/************************************************ */

/**************    OrderStatus   ******************* */
const orderStatusId = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};
const createOrderStatus = {
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255).required(),
    name_ar: Joi.string().trim().min(2).max(255).required(),
    active: Joi.boolean(),
  }),
};

const updateOrderStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255),
    name_ar: Joi.string().trim().min(2).max(255),
    active: Joi.boolean(),
  }),
};

const getOrderStatusList = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(5).max(100),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid(
      "createdAt",
      "-createdAt",
      "name_en",
      "-name_en",
      "name_ar",
      "-name_ar"
    ),
  }),
};
/************************************************ */

/**************    Unit   ******************* */
const unitId = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};
const createUnit = {
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255).required(),
    name_ar: Joi.string().trim().min(2).max(255).required(),
    active: Joi.boolean(),
  }),
};

const updateUnit = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255),
    name_ar: Joi.string().trim().min(2).max(255),
    active: Joi.boolean(),
  }),
};

const getUnitList = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(5).max(100),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid(
      "createdAt",
      "-createdAt",
      "name_en",
      "-name_en",
      "name_ar",
      "-name_ar"
    ),
  }),
};
/************************************************ */

/**************    Payment Method   ******************* */
const paymentMethodId = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};
const createPaymentMethod = {
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255).required(),
    name_ar: Joi.string().trim().min(2).max(255).required(),
    active: Joi.boolean(),
  }),
};

const updatePaymentMethod = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    name_en: Joi.string().trim().min(2).max(255),
    name_ar: Joi.string().trim().min(2).max(255),
    active: Joi.boolean(),
  }),
};

const getPaymentMethodList = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(5).max(100),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid(
      "createdAt",
      "-createdAt",
      "name_en",
      "-name_en",
      "name_ar",
      "-name_ar"
    ),
  }),
};
/************************************************ */

/**************    Complaints   ******************* */
const complaintId = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};
const createComplaint = {
  body: Joi.object().keys({
    email: Joi.string().trim().lowercase().email().required(),
    name: Joi.string().trim().min(2).max(255).required(),
    title: Joi.string().trim().min(2).max(255).required(),
    complaints: Joi.string().trim().min(5).max(2000).required(),
    active: Joi.boolean(),
  }),
};

const answerComplaint = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    answer: Joi.string().trim().min(5).max(2000).required(),
  }),
};

const getComplaintList = {
  query: Joi.object().keys({
    answered: Joi.boolean(),
    limit: Joi.number().integer().min(5).max(100),
    page: Joi.number().integer().min(1),
    sort: Joi.string().valid(
      "createdAt",
      "-createdAt",
      "-updatedAt",
      "email",
      "-email",
      "name",
      "-name"
    ),
  }),
};
/************************************************ */

/**************    SystemInfo   ******************* */
const updateSystemInfo = {
  body: Joi.object().keys({
    app_name: Joi.string().trim().min(2).max(255),
    phone: Joi.string().min(7).max(16),
    city: Joi.string().trim().min(2).max(255),
    region: Joi.string().trim().min(2).max(255),
    zip: Joi.string().trim().min(2).max(20),
    address: Joi.string().trim().min(2).max(500),
    vat: Joi.number().min(0),
    vat_number: Joi.string().min(2).max(100),
    commission: Joi.number().min(0),
    currency: Joi.string().trim().min(1).max(20),
    logo: Joi.string().min(2).max(255),
  }),
};
/************************************************ */

module.exports = {
  shippingId,
  createShipping,
  updateShipping,
  getShippingList,
  itemSizeId,
  createItemSize,
  updateItemSize,
  getItemSizeList,
  itemGroupId,
  createItemGroup,
  updateItemGroup,
  getItemGroupList,
  itemCategoryId,
  createItemCategory,
  updateItemCategory,
  getItemCategoryList,
  getCategoryHeroProduct,
  purityId,
  createPurity,
  updatePurity,
  getPurityList,
  orderStatusId,
  createOrderStatus,
  updateOrderStatus,
  getOrderStatusList,
  unitId,
  createUnit,
  updateUnit,
  getUnitList,
  paymentMethodId,
  createPaymentMethod,
  updatePaymentMethod,
  getPaymentMethodList,
  complaintId,
  createComplaint,
  answerComplaint,
  getComplaintList,
  updateSystemInfo,
  BrandId,
  createBrand,
  updateBrand,
  getBrandList,
};
