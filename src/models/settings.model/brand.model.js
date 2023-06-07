const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const brand = new Schema({
  name_ar: {
    type: String,
  },
  name_en: {
    type: String,
  },
  images: {
    type: [Schema.Types.ObjectId],
    ref: 'uploads',
    default: [],
  },
  active: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true
});

brand.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

brand.plugin(mongooseI18nLocalize, {
  locales: ['ar', 'en']
});
brand.plugin(mongoosePaginate);

module.exports = mongoose.model('brand', brand);
