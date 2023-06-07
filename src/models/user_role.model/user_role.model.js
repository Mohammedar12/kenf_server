const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const UserRoleSchema = new Schema({
    name_ar: {
      type: String,
    },
    name_en: {
      type: String,
    },
    permissions: [{
      permission: String,
      group: String,
    }],
    active: {
      type: Boolean,
      default: true
    },
}, { timestamps: true });

UserRoleSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

UserRoleSchema.plugin(mongooseI18nLocalize, { locales: ['ar', 'en'] });
UserRoleSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('user_role', UserRoleSchema);
