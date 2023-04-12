const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const items_size = new Schema({
  name_ar: {
    type: String,
  },
  name_en: {
    type: String,
  },
  unit: {
    type: String
  },
  active: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true
});

items_size.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

items_size.plugin(mongooseI18nLocalize, {
  locales: ['ar', 'en']
});
items_size.plugin(mongoosePaginate);

module.exports = mongoose.model('items_size', items_size);
