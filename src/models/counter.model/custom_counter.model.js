const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomCounterSchema = new Schema({
  collection_name: {
    type: String,
  },
  field_name: {
    type: String,
  },
  counter: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

CustomCounterSchema.index({collection_name: 1, field_name: 1}, {unique: true});

module.exports = mongoose.model('custom_counter', CustomCounterSchema);
