const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;
const { roles } = require('../../config/roles');

const userSchema = new Schema({
  name: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
    lowercase: true,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  confirmationCode: {
    code: { type: String },
    codeType: {
      type: String,
      enum: ['Email', 'Phone'],
    },
    createdAt: {type: Date},
  },
  address: {
      fullname: {
        type: String
      },
      phone: {
        type: String
      },
      email: {
        type: String
      },
      country: {
        type: String
      },
      city: {
        type: String
      },
      zipCode: {
        type: String
      },
      street: {
        type: String
      }
  },
  billingAddress: {
      fullname: {
        type: String
      },
      phone: {
        type: String
      },
      email: {
        type: String
      },
      country: {
        type: String
      },
      city: {
        type: String
      },
      zipCode: {
        type: String
      },
      street: {
        type: String
      }
  },
  cart: {
      type: [{
        id: {
          type: Schema.Types.ObjectId,
          ref: 'product',
        },
        quantity: {
          type: Number,
        }
      }],
      default: []
  },
  role: {
    type: String,
    enum: roles,
    required: true,
    default: 'user'
  },
  status: {
    type: Boolean,
    default: true
  },
  loginType:{
    type: String,
    enum: ['email','phone']
  }
}, {
  timestamps: true
});

userSchema.plugin(mongoosePaginate);

userSchema.index({name: 'text', email: 'text', phone: 'text' });

userSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('user', userSchema);
