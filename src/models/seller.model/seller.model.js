const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const sellerSchema = new Schema({
    name_ar: {
      type: String,
    },
    name_en: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    city: {
      type: String,
    },
    region: {
      type: String,
    },
    zip: {
      type: String,
    },
    address_ar: {
      type: String,
    },
    address_en: {
      type: String,
    },
    description_ar: {
      type: String,
    },
    description_en: {
      type: String,
    },
    documents: {
      type: [String],
    },
    active: {
        type: Boolean,
        default: true,
        index: true
    },
}, { timestamps: true });

sellerSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});


sellerSchema.plugin(mongooseI18nLocalize, { locales: ['ar', 'en'] });
sellerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('sellers', sellerSchema);
