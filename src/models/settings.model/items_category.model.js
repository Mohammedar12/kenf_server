const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const items_category = new Schema({
  name_ar: {
    type: String,
  },
  name_en: {
    type: String,
  },
  kenf_collection: {
    type: String,
  },
  abbreviation: {
    type: String,
  },
  images: {
    type: [Schema.Types.ObjectId],
    ref: 'uploads',
    default: [],
  },
  isKenf: {
    type: Boolean,
    default: false,
    index: true,
  },
  active: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true
});

items_category.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

items_category.plugin(mongooseI18nLocalize, {
  locales: ['ar', 'en']
});
items_category.plugin(mongoosePaginate);

module.exports = mongoose.model('items_category', items_category);
