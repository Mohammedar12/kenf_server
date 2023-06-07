const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const units = new Schema({
  name_ar: {
    type: String,
  },
  name_en: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true
});

units.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

units.plugin(mongooseI18nLocalize, {
  locales: ['ar', 'en']
});
units.plugin(mongoosePaginate);

module.exports = mongoose.model('units', units);
