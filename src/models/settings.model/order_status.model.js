const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const order_status = new Schema({
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

order_status.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

order_status.plugin(mongooseI18nLocalize, {
  locales: ['ar', 'en']
});
order_status.plugin(mongoosePaginate);

module.exports = mongoose.model('order_status', order_status);
