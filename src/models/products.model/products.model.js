const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name_ar: {
    type: String,
  },
  name_en: {
    type: String,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'items_category',
    index: true
  },
  kenf_collection: {
    type: Schema.Types.ObjectId,
    ref: 'items_category',
    index: true
  },
  purity: {
    type: [Schema.Types.ObjectId],
    ref: 'purity',
    index: true,
  },
  shop: {
    type: Schema.Types.ObjectId,
    ref: 'shop',
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
    ref: 'items_group',
    index: true
  },
  unit: {
    type: [Schema.Types.ObjectId],
    ref: 'units',
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
    ref: 'uploads'
  },
  mainImage: {
    type: Schema.Types.ObjectId,
    ref: 'uploads'
  },
  meta: {
    title: String,
    keywords: [String],
    description: String,
  },
  color: {
    type: String,
    enum: ['Yellow', 'White', 'Multi'],
    default: 'White',
    index: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
  },
  hidden: {
    type: Boolean,
    default: false,
    index: true
  },
  ringSize: {
    type: Schema.Types.ObjectId,
    ref: 'items_size',
    index: true
  },
  visited: {
    type: Number,
    default: 0,
    index: true
  },
  isExclusive: {
    type: Boolean,
    default: false,
    index: true
  },
  active: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true
});
productSchema.index({'$**': 'text'});
productSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret.password;
    delete ret._id;
    delete ret.__v;
  }
});

productSchema.plugin(mongooseI18nLocalize, {
  locales: ['en', 'ar']
});
productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('product', productSchema);
