const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const coupon = new Schema({
  user: {
    type: String
  },
  email: {
    type: String,
    index: true,
    lowercase: true,
  },
  code: {
    type: String,
    unique: true,
    uppercase: true,
  },
  discount_type: {
    type: String,
    enum: ['percent', 'fixed']
  },
  discount: {
    type: Number,
  },
  max_discount: {
    type: Number
  },
  profit: {
    type: Number
  },
  profit_type: {
    type: String,
    enum: ['percent', 'fixed']
  },
  total_purchase_condition: {
    type: Number
  },
  included_category: {
    type: Schema.Types.ObjectId,
    ref: 'items_category'
  },
  except_discounted_product: {
    type: Boolean,
    default: true
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  freeShipping: {
    type: [Schema.Types.ObjectId],
    ref: 'shipping',
    default: null
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
}, {
  timestamps: true
});

coupon.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});
coupon.plugin(mongooseI18nLocalize, {
  locales: ['ar', 'en']
});
coupon.plugin(mongoosePaginate);

module.exports = mongoose.model('coupon', coupon);
