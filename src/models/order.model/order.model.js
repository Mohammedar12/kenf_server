const mongoose = require("mongoose");
const mongooseI18nLocalize = require('mongoose-i18n-localize');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    tryoto_id: {
        type: Number,
        unique: true,
        sparse: true,
    },
    shipping: {
        type: Schema.Types.ObjectId,
        ref: 'shipping'
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    items: {
        type: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'product',
                },
                quantity: Number,
                price: Number
            }
        ]
    },
    status: {
        type: String,
        enum: [
            'WAITING','REJECTED','CANCELED',
            'ACCEPTED', 'SHIPPED', 'PREPARED', 'DELIVERED'
        ],
        default: 'WAITING'
    },
    rejectReason: {
        type: String
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'CREDIT']
    },
    offer: {
        type: Schema.Types.ObjectId,
        ref: 'offer'
    },
    coupon: {
        type: Schema.Types.ObjectId,
        ref: 'coupon',
    },
    price: {
        type: Number
    },
    discount: {
        type: Number,
        default: 0
    },
    effectivePrice: {
        type: Number,
    },
    tax: {
        type: Number,
        default: 0
    },
    shippingPrice: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number
    },
    paymentInfo:{
        invoiceId: { type: String, unique: true,sparse: true },
        completedAt: { type: Date },
        paymentId: { type: String },
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'FAILED', 'SUCCESS', 'REFUNDED'],
    },
    deliveryInfo: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        address: { type: String },
        city: { type: String },
        country: { type: String },
        zipCode: { type: String }
    },
    billingInfo: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        address: { type: String },
        city: { type: String },
        country: { type: String },
        zipCode: { type: String }
    },
    cart: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
orderSchema.index({ coupon: 1, paymentStatus: 1 });
orderSchema.plugin(mongooseI18nLocalize, { locales: ['ar', 'en'] });
orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('order', orderSchema);
