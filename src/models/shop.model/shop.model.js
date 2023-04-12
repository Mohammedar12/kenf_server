const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const shopSchema = new Schema({
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'sellers'
    },
    app_name_en: {
      type: String,
    },
    app_name_ar: {
      type: String,
    },
    app_abbreviation: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
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
    commission: {
      type: Number,
    },
    images: {
      type: [Schema.Types.ObjectId],
      ref: 'uploads'
    },
    active: {
        type: Boolean,
        default: true,
        index: true
    },
}, { timestamps: true });

shopSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

shopSchema.plugin(mongooseI18nLocalize, { locales: ['ar', 'en'] });
shopSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('shop', shopSchema);
