const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const uploadSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    link: {
        type: String,
    },
    file_type: {
        type: String,
    },
    access: {
        type: String,
        enum: ['public', 'admin', 'private'],
    },
}, { timestamps: true });

uploadSchema.set('toJSON', {
    transform: function(doc, ret, options) {
      ret.id = ret._id;
      delete ret.password;
      delete ret._id;
      delete ret.__v;
    }
  });

module.exports = mongoose.model('uploads', uploadSchema);
