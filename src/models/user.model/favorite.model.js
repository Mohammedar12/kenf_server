const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const faviroteSchema = new Schema({
  user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      index: true,
  },
  product: {
      type: Schema.Types.ObjectId,
      ref: 'product'
  },
}, {
  timestamps: true
});

faviroteSchema.index({ user: 1, product: 1}, { unique: true });
faviroteSchema.plugin(mongoosePaginate);

faviroteSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});


module.exports = mongoose.model('favirotes', faviroteSchema);
