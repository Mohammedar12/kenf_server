const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const complaints = new Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  complaints: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  answer: {
    type: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
}, {
  timestamps: true
});

complaints.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

complaints.plugin(mongooseI18nLocalize, {
  locales: ['ar', 'en']
});

module.exports = mongoose.model('complaints', complaints);
