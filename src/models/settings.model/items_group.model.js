const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const items_group = new Schema({
  name_ar: {
    type: String,
  },
  name_en: {
    type: String,
  },
  abbreviation: {
    type: String,
  },
  images: {
    // type: String,
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

items_group.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});
items_group.plugin(mongooseI18nLocalize, {
  locales: ['ar', 'en']
});
items_group.plugin(mongoosePaginate);

module.exports = mongoose.model('items_group', items_group);

