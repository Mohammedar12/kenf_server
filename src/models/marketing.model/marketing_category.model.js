const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const marketing_category = new Schema({
  name_ar: {
    type: String,
  },
  name_en: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true
});

marketing_category.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

marketing_category.plugin(mongooseI18nLocalize, {
  locales: ['ar', 'en']
});
marketing_category.plugin(mongoosePaginate);

module.exports = mongoose.model('marketing_category', marketing_category);
