const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const offer = new Schema({
  name_ar: {
    type: String,
  },
  name_en: {
    type: String,
  },
  description_ar: {
    type: String,
  },
  description_en: {
    type: String,
  },
  discount: {
    type: Number,
  },
  start_date: {
    type: Date,
  },
  end_date: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
}, {
  timestamps: true
});

offer.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

offer.plugin(mongooseI18nLocalize, {
  locales: ['ar', 'en']
});
offer.plugin(mongoosePaginate);

module.exports = mongoose.model('offer', offer);
