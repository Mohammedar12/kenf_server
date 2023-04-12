const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');

var Schema = mongoose.Schema;

var privacy_policy = {
  text_ar: {
    type: String,
  },
  text_en: {
    type: String,
  },
}

var privacyPolicySchema = new Schema(privacy_policy, {
  timestamps: true
});
privacyPolicySchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

var systemInfo = mongoose.model('privacy_policy', privacyPolicySchema);

module.exports = systemInfo;
