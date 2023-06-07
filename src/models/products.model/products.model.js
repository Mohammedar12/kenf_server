const mongoose = require("mongoose");
const mongooseI18nLocalize = require("mongoose-i18n-localize");
const mongoosePaginate = require("mongoose-paginate-v2");
const CustomCounter = require("../counter.model/custom_counter.model.js");
const Shop = require("../shop.model/shop.model.js");
const Category = require("../settings.model/items_category.model.js");
const Group = require("../settings.model/items_group.model.js");
const Purity = require("../settings.model/purity.model.js");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name_ar: {
      type: String,
    },
    name_en: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "items_category",
      index: true,
    },
    kenf_collection: {
      type: Schema.Types.ObjectId,
      ref: "items_category",
      index: true,
    },
    brand: {
      type: [Schema.Types.ObjectId],
      ref: "brand",
      index: true,
    },
    purity: {
      type: [Schema.Types.ObjectId],
      ref: "purity",
      index: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "shop",
      index: true,
    },
    weight: {
      type: Number,
    },
    quantity: {
      type: Number,
    },
    extra_price: {
      type: Number,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "items_group",
      index: true,
    },
    unit: {
      type: [Schema.Types.ObjectId],
      ref: "units",
    },
    commission: {
      type: Number,
    },
    description_ar: {
      type: String,
    },
    description_en: {
      type: String,
    },
    images: {
      type: [Schema.Types.ObjectId],
      ref: "uploads",
    },
    mainImage: {
      type: Schema.Types.ObjectId,
      ref: "uploads",
    },
    meta: {
      title: String,
      keywords: [String],
      description: String,
    },
    color: {
      type: String,
      enum: ["Yellow", "White", "Multi"],
      default: "White",
      index: true,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
    },
    hidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    ringSize: {
      type: Schema.Types.ObjectId,
      ref: "items_size",
      index: true,
    },
    visited: {
      type: Number,
      default: 0,
      index: true,
    },
    isExclusive: {
      type: Boolean,
      default: false,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
productSchema.index({ "$**": "text" });
productSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret.password;
    delete ret._id;
    delete ret.__v;
  },
});

productSchema.plugin(mongooseI18nLocalize, {
  locales: ["en", "ar"],
});
productSchema.plugin(mongoosePaginate);
productSchema.pre("save", function (next) {
  if (this.isNew) {
    let product = this;
    CustomCounter.findOneAndUpdate(
      { collection_name: "product", field_name: "barcode" },
      { $inc: { counter: 1 } },
      { upsert: true, new: true }
    )
      .then(async (results) => {
        let shop_abbr = (
          await Shop.findOne({ _id: product.shop }, "app_abbreviation")
        )?.app_abbreviation;
        let group_abbr = (
          await Group.findOne({ _id: product.group }, "abbreviation")
        )?.abbreviation;
        let category_abbr = (
          await Category.findOne({ _id: product.category }, "abbreviation")
        )?.abbreviation;
        let purity = "";
        if (product.purity && product.purity.length > 0)
          purity = (await Purity.findOne({ _id: product.purity[0] }, "name_en"))
            ?.name_en;
        if (!shop_abbr) shop_abbr = "";
        if (!group_abbr) group_abbr = "";
        if (!category_abbr) category_abbr = "";
        if (!purity) purity = "";
        console.log(
          shop_abbr +
            "-" +
            group_abbr +
            category_abbr +
            purity +
            String(results.counter).padStart(5, "0")
        );
        product.barcode =
          shop_abbr +
          "-" +
          group_abbr +
          category_abbr +
          purity +
          String(results.counter).padStart(5, "0");
        next();
      })
      .catch((e) => {
        next(e);
      });
  }
});

module.exports = mongoose.model("product", productSchema);
