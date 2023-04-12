const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

var terms = {
  text_ar: {
    type: String,
  },
  text_en: {
    type: String,
  },
}

var termsSchema = new Schema(terms, {
  timestamps: true
});
termsSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

var systemInfo = mongoose.model('terms', termsSchema);

module.exports = systemInfo;
