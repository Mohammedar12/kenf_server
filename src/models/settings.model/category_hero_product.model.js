import mongoose, {
    Schema
  } from "mongoose";
  import mongooseI18nLocalize from 'mongoose-i18n-localize';
  
  
  const category_hero_product = new Schema({
    product: {
        type: Number,
        ref: 'product',
        required: true,
        index: true
    },
    category: {
        type: Number,
        ref: 'items_category',
        required: true
    },
    group: {
        type: Number,
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
  
  export default mongoose.model('category_hero_product', category_hero_product);
  