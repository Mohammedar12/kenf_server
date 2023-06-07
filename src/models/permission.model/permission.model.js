const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

PermissionSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

PermissionSchema.plugin(mongooseI18nLocalize, { locales: ['ar', 'en'] });

module.exports = mongoose.model('permission', PermissionSchema);
