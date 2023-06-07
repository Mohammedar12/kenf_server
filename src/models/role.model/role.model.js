const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    user_id: { //created_by
      type: Number,
      required: true
    },
    permissions: {
      type: [Number],
    },
    deleted: {
        type: Boolean,
        default: false
    },

}, { timestamps: true });

RoleSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

RoleSchema.plugin(mongooseI18nLocalize, { locales: ['ar', 'en'] });

module.exports = mongoose.model('role', RoleSchema);
