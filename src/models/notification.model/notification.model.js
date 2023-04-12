const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const NotifSchema = new Schema({
    resource: {
        type: Number,
        ref: 'user'
    },
    target: {
        type: Number,
        ref: 'user'
    },
    title:{
        type:String
    },
    subjectType:{
        type:String
    },
    subjectId:{
        type:String
    },
    text:{
        type:String
    },
    read:{
        type:Boolean,
        default:false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    users:{
        type: [Number],
        ref: 'user'
    },
    usersDeleted:{
        type: [Number],
        ref: 'user'
    },
    order:{
        type: Number,
        ref: 'order'
    },
    image:{
        type: String
    }
}, { timestamps: true });

NotifSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

NotifSchema.plugin(mongooseI18nLocalize,{locales:['ar','en']});

module.exports = mongoose.model('notification', NotifSchema);
