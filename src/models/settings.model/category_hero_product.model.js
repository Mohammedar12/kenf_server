const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;
  
  
  const category_hero_product = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'product',
        required: true,
        index: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'items_category',
        required: true
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: 'items_group'
    }
  }, {
    timestamps: true
  });

  category_hero_product.index({ category: 1, group: 1 }, { unique: true});
  
  category_hero_product.set('toJSON', {
    transform: function(doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  });

  category_hero_product.plugin(mongooseI18nLocalize, {
    locales: ['ar', 'en']
  });
  
  module.exports = mongoose.model('category_hero_product', category_hero_product);
  