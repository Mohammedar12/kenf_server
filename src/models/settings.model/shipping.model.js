const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const shipping = new Schema({
  company: {
    type: String
  },
  price: {
    type: Number
  },
  time: {
    type: String
  },
}, {
  timestamps: true
});

shipping.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

shipping.plugin(mongooseI18nLocalize, {
  locales: ['ar', 'en']
});
shipping.plugin(mongoosePaginate);

module.exports = mongoose.model('shipping', shipping);
