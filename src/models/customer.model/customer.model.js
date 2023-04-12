const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  address: {
    type: String
  }
}, {
  timestamps: true
});

CustomerSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

CustomerSchema.plugin(mongooseI18nLocalize, {
  locales: ['en', 'ar']
});
CustomerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('customer', CustomerSchema);
