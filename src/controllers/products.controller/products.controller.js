const Product = require("../../models/products.model/products.model");
const ItemsCategory = require("../../models/settings.model/items_category.model");
const Purity = require("../../models/settings.model/purity.model");
const Unit = require("../../models/settings.model/units.model");
const Shop = require("../../models/shop.model/shop.model");
const ItemGroup = require("../../models/settings.model/items_group.model");
const ItemSize = require("../../models/settings.model/items_size.model");
const category_hero_product = require("../../models/settings.model/category_hero_product.model");
const Upload = require("../../models/upload.model/upload.model");
const logger = require("../../config/logger");
const convertObjectId = require("../../helpers/convertObjectId");
const catchAsync = require("../../helpers/catchAsync");
const pick = require("../../helpers/pick");
const ApiError = require("../../helpers/ApiError");
const Favorite = require("../../models/user.model/favorite.model");

const createProduct = catchAsync(async (req, res, next) => {
  const body = pick(req.body, [
    "name_ar",
    "name_en",
    "category",
    "kenf_collection",
    "brand",
    "purity",
    "shop",
    "weight",
    "quantity",
    "extra_price",
    "group",
    "unit",
    "commission",
    "description_ar",
    "description_en",
    "meta",
    "color",
    "barcode",
    "hidden",
    "ringSize",
    "isExclusive",
    "active",
    "images",
    "mainImage",
  ]);
  await _validateForeignIds(body);
  try {
    if (body.images) {
      const validImages = await _validateUploads(body.images);
      if (!validImages) {
        return res.status(400).json({
          status: 400,
          message: "Invalid images",
        });
      }
    }
    if (body.mainImage) {
      const validMainImage = await _validateUploads([body.mainImage]);
      if (!validMainImage) {
        return res.status(400).json({
          status: 400,
          message: "Invalid main images",
        });
      }
    }
    const product = await Product.create(body);
    if (req.body.isSpecial) {
      if (req.body.special_cat_id) {
        let special_cat = await ItemsCategory.findOne({
          _id: convertObjectId(req.body.special_cat_id),
        });
        if (!special_cat) {
          await Product.deleteOne({ _id: product.id });
          return res
            .status(400)
            .json({ message: "Special category not found" });
        }
        let hero_product_mapping = await category_hero_product.findOne({
          product: product.id,
        });
        if (
          hero_product_mapping &&
          hero_product_mapping.category !==
            convertObjectId(req.body.special_cat_id)
        ) {
          if (
            (special_cat.isKenf &&
              hero_product_mapping.group !== convertObjectId(body.group)) ||
            !special_cat.isKenf
          ) {
            await category_hero_product.deleteOne({
              _id: hero_product_mapping.id,
            });
          }
          hero_product_mapping = undefined;
        }
        if (special_cat.isKenf) {
          hero_product_mapping = await category_hero_product.findOne({
            category: convertObjectId(req.body.special_cat_id),
            group: undefined,
          });
        } else {
          hero_product_mapping = await category_hero_product.findOne({
            category: convertObjectId(req.body.special_cat_id),
            group: product.group,
          });
        }
        if (hero_product_mapping) {
          hero_product_mapping.product = product.id;
          await hero_product_mapping.save();
        } else {
          if (special_cat.isKenf) {
            await category_hero_product.create({
              product: product.id,
              category: convertObjectId(req.body.special_cat_id),
            });
          } else {
            await category_hero_product.create({
              product: product.id,
              category: convertObjectId(req.body.special_cat_id),
              group: product.group,
            });
          }
        }
      }
    }
    return res.status(200).json({
      status: 200,
      message: "Product created",
      data: product,
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});

const updateProduct = catchAsync(async (req, res, next) => {
  const product_id = req.params.id;
  const body = pick(req.body, [
    "name_ar",
    "name_en",
    "category",
    "kenf_collection",
    "purity",
    "shop",
    "weight",
    "quantity",
    "extra_price",
    "group",
    "unit",
    "commission",
    "description_ar",
    "description_en",
    "meta",
    "color",
    "barcode",
    "hidden",
    "ringSize",
    "isExclusive",
    "active",
    "images",
    "mainImage",
  ]);
  await _validateForeignIds(body);
  try {
    if (body.images) {
      const validImages = await _validateUploads(body.images);
      if (!validImages) {
        return res.status(400).json({
          status: 400,
          message: "Invalid images",
        });
      }
    }
    if (body.mainImage) {
      const validMainImage = await _validateUploads([body.mainImage]);
      if (!validMainImage) {
        return res.status(400).json({
          status: 400,
          message: "Invalid main images",
        });
      }
    }
    const update = await Product.updateOne(
      { _id: convertObjectId(product_id) },
      body
    );
    if (update.nModified == 0) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }
    if (req.body.isSpecial) {
      if (req.body.special_cat_id) {
        let special_cat = await ItemsCategory.findOne({
          _id: convertObjectId(req.body.special_cat_id),
        });
        if (!special_cat) {
          return res
            .status(400)
            .json({ message: "Special category not found" });
        }
        let hero_product_mapping = await category_hero_product.findOne({
          product: convertObjectId(product_id),
        });
        if (
          hero_product_mapping &&
          hero_product_mapping.category !==
            convertObjectId(req.body.special_cat_id)
        ) {
          if (
            (special_cat.isKenf &&
              hero_product_mapping.group !== convertObjectId(body.group)) ||
            !special_cat.isKenf
          ) {
            await category_hero_product.deleteOne({
              _id: hero_product_mapping.id,
            });
          }
          hero_product_mapping = undefined;
        }
        if (special_cat.isKenf) {
          hero_product_mapping = await category_hero_product.findOne({
            category: convertObjectId(req.body.special_cat_id),
            group: undefined,
          });
        } else {
          hero_product_mapping = await category_hero_product.findOne({
            category: convertObjectId(req.body.special_cat_id),
            group: convertObjectId(body.group),
          });
        }
        if (hero_product_mapping) {
          hero_product_mapping.product = convertObjectId(product_id);
          await hero_product_mapping.save();
        } else {
          if (special_cat.isKenf) {
            await category_hero_product.create({
              product: convertObjectId(product_id),
              category: convertObjectId(req.body.special_cat_id),
            });
          } else {
            await category_hero_product.create({
              product: convertObjectId(product_id),
              category: convertObjectId(req.body.special_cat_id),
              group: convertObjectId(body.group),
            });
          }
        }
      }
    }
    return res.status(200).json({
      status: 200,
      message: "Product updated",
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findOne(
    { _id: convertObjectId(productId) },
    "id"
  );
  if (!product) {
    return res.status(404).json({
      status: 404,
      message: "Product not found",
    });
  }
  await Product.deleteOne({ _id: product.id });
  return res.status(200).json({
    status: 200,
    message: "Product deleted successfully.",
  });
});

const getProductAdmin = catchAsync(async (req, res, next) => {
  try {
    let query = pick(req.query, ["id", "barcode"]);
    if (query.id) {
      query._id = convertObjectId(query.id);
      delete query.id;
    }
    let product = await Product.findOne(query)
      .populate("unit")
      .populate("images")
      .populate("group")
      .populate("mainImage")
      .populate("shop")
      .populate("purity")
      .populate("category");
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found.",
      });
    }
    product = product.toJSON();
    let special_cat = await category_hero_product
      .findOne({ product: product.id })
      .populate("category")
      .populate("group");
    product.special_cat = special_cat;
    return res.status(200).json({
      status: 200,
      message: "",
      data: product,
    });
  } catch (e) {
    return res.status(404).json({
      status: 404,
      message: "Product not found.",
    });
  }
});

const getProductListAdmin = catchAsync(async (req, res, next) => {
  const filter = pick(req.query, ["category", "groups", "shops", "search"]);
  const options = pick(req.query, ["sort", "limit", "page"]);
  if (filter.categories) {
    filter.category = { $in: filter.category };
    delete filter.categories;
  }
  if (filter.groups) {
    filter.group = { $in: filter.groups };
    delete filter.groups;
  }
  if (filter.shops) {
    filter.shop = { $in: filter.shops };
    delete filter.shops;
  }
  if (filter.search && search.search !== "") {
    filter["$text"] = { $search: filter.search };
    delete filter.search;
  }
  if (!options.sort || options.sort === "") {
    options.sort = "-createdAt";
  }
  options.populate = [
    "unit",
    "mainImage",
    "images",
    "group",
    "shop",
    "purity",
    "category",
  ];
  //options.select = "_id name_ar name_en active";
  const result = await Product.paginate(filter, options);
  return res.status(200).json({
    status: 200,
    message: "",
    data: result,
  });
});

const getProductListApp = catchAsync(async (req, res, next) => {
  const filter = pick(req.query, [
    "isExclusive",
    "group",
    "category",
    "purity",
    "color",
    "kenf_collection",
  ]);
  const options = pick(req.query, ["sort", "limit", "page"]);
  if (!options.sort || options.sort === "") {
    options.sort = "-createdAt";
  }
  if (filter.group) {
    filter.group = { $in: filter.group };
  }
  if (filter.color) {
    filter.color = { $in: filter.color };
  }
  if (filter.purity) {
    filter.purity = { $in: filter.purity };
  }
  filter.active = true;
  filter.hidden = false;
  options.populate = [
    { path: "mainImage", select: "id link" },
    { path: "images", select: "id link" },
  ];
  options.select = {
    id: 1,
    name_ar: 1,
    name_en: 1,
    mainImage: 1,
    images: { $first: "$images" },
    extra_price: 1,
  };
  const result = await Product.paginate(filter, options);
  return res.status(200).json({
    status: 200,
    message: "",
    data: result,
  });
});

const productIsAvailable = catchAsync(async (req, res, next) => {
  const productId = convertObjectId(req.params.id);
  const update = await Product.updateOne(
    { _id: productId },
    {
      $inc: {
        visited: 1,
      },
    }
  );
  if (update.nModified === 0) {
    return res.status(404).json({
      status: 404,
      message: "Product not found",
    });
  }
  const product = await Product.exists({
    _id: productId,
    quantity: { $gt: 0 },
  });
  return res.status(200).json({
    status: 200,
    message: "",
    data: {
      available: product ? true : false,
    },
  });
});

const getProductApp = catchAsync(async (req, res, next) => {
  const productId = convertObjectId(req.params.id);
  let product = await Product.findOne(
    {
      _id: productId,
      active: true,
    },
    "id name_en name_ar category brand kenf_collection purity weight quantity extra_price group description_ar description_en images mainImage meta"
  )
    .populate("images", "id link")
    .populate("mainImage", "id link")
    .populate("purity", "id name_en name_ar")
    .populate({
      path: "brand",
      select: "id name_en name_ar",
      populate: {
        path: "images",
        select: "id link",
      },
    });

  if (!product) {
    return res.status(404).json({
      status: 404,
      message: "Product not found",
    });
  }
  product = product.toJSON();
  product.images = product.images?.filter((val) => val != null);
  if (!product.quantity || product.quantity <= 0) {
    product.outofStock = true;
  } else {
    product.outofStock = false;
  }
  delete product.quantity;
  if (req.user?.id) {
    const isFavorite = await Favorite.exists({
      user: req.user.id,
      product: productId,
    });
    product.isFavorite = isFavorite ? true : false;
  }
  await Product.updateOne(
    { _id: productId, active: true },
    {
      $inc: {
        visited: 1,
      },
    }
  );

  const similiarProducts1 = await Product.find(
    {
      category: product.category,
      group: product.group,
      _id: { $ne: product.id },
      active: true,
      hidden: false,
    },
    {
      id: 1,
      images: { $first: "$images" },
      mainImage: 1,
      name_en: 1,
      name_ar: 1,
      extra_price: 1,
    }
  )
    .limit(8)
    .populate([
      { path: "mainImage", select: "id link" },
      { path: "images", select: "id link" },
    ]);
  const similiarProducts2 = await Product.find(
    {
      category: product.category,
      group: { $ne: product.group },
      active: true,
      hidden: false,
    },
    {
      id: 1,
      images: { $first: "$images" },
      mainImage: 1,
      name_en: 1,
      name_ar: 1,
      extra_price: 1,
    }
  )
    .limit(8)
    .populate([
      { path: "mainImage", select: "id link" },
      { path: "images", select: "id link" },
    ]);

  product.similarProducts = [similiarProducts1, similiarProducts2];

  return res.status(200).json({
    status: 200,
    message: "",
    data: product,
  });
});

const findProducts = catchAsync(async (req, res, next) => {
  const productIds = req.query.products.map((id) => convertObjectId(id));
  const products = await Product.find(
    { _id: { $in: productIds }, active: true },
    {
      id: 1,
      name_en: 1,
      name_ar: 1,
      images: { $first: "$images" },
      mainImage: 1,
      extra_price: 1,
      quantity: 1,
    }
  ).populate([
    { path: "images", select: "id link" },
    { path: "mainImage", select: "id link" },
  ]);
  return res.status(200).json({
    status: 200,
    message: "",
    data: products,
  });
});

const _validateForeignIds = async (body) => {
  if (body.category !== undefined) {
    const category_exists = await ItemsCategory.exists({ _id: body.category });
    if (!category_exists) {
      throw new ApiError(400, "Invalid category id");
    }
  }
  if (body.kenf_collection !== undefined) {
    const kenf_category_exists = await ItemsCategory.exists({
      _id: body.kenf_collection,
    });
    if (!kenf_category_exists) {
      throw new ApiError(400, "Invalid kenf_collection id");
    }
  }
  if (body.purity !== undefined) {
    const purity_count = await Purity.countDocuments({
      _id: { $in: body.purity },
    });
    if (purity_count !== body.purity.length) {
      throw new ApiError(400, "Invalid purity id");
    }
  }
  if (body.shop !== undefined) {
    const shop_exists = await Shop.exists({ _id: body.shop });
    if (!shop_exists) {
      throw new ApiError(400, "Invalid shop id");
    }
  }
  if (body.group !== undefined) {
    const group_exists = await ItemGroup.exists({ _id: body.group });
    if (!group_exists) {
      throw new ApiError(400, "Invalid group id");
    }
  }
  if (body.unit !== undefined) {
    const unit_count = await Unit.countDocuments({ _id: { $in: body.unit } });
    if (unit_count !== body.unit.length) {
      throw new ApiError(400, "Invalid unit id");
    }
  }
  if (body.ringSize !== undefined) {
    const ring_size_exists = await ItemSize.exists({ _id: body.ringSize });
    if (!ring_size_exists) {
      throw new ApiError(400, "Invalid ringSize id");
    }
  }
};

const _validateUploads = async (ids) => {
  for (let i = 0; i < ids.length; i++) {
    ids[i] = convertObjectId(ids[i]);
  }
  const count = await Upload.countDocuments({ _id: { $in: ids } });
  if (ids.length != count) {
    return false;
  }
  return true;
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductListAdmin,
  getProductListApp,
  productIsAvailable,
  getProductAdmin,
  getProductApp,
  findProducts,
};
