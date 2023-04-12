const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const payment_method = new Schema({
  name_ar: {
    type: String,
  },
  name_en: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
}, {
  timestamps: true
});

payment_method.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

payment_method.plugin(mongooseI18nLocalize, {
  locales: ['ar', 'en']
});
payment_method.plugin(mongoosePaginate);

module.exports = mongoose.model('payment_method', payment_method);
