import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import paginate from 'mongoose-paginate-v2';

const orderSchema = new Schema({
    order_id: {
        type: Number,
        required: true,
        default: 0
    },
    deleted: {
        type: Boolean,
        default: false
    },
    shipping_id: {
        type: Number,
        ref: 'shipping'
    },
    tax: {
        type: Number,
        default: 0
    },
    shippingPrice: {
        type: Number,
        default: 0
    },
    customer_id: {
        type: Object(String),
        ref: 'user',
        required: true
    },
    products: {
        type: [Number],
        ref: 'product'
    },
    status: {
        type: String,
        enum: ['WAITING',
            'ACCEPTED',
            'REJECTED',
            'CANCELED',
            'SHIPPED', 'PREPARED', 'HAND_OVERED',
            'DELIVERED'],
        default: 'WAITING'
    },
    rejectReason: {
        type: String
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'CREDIT']
    },
    offer_id: {
        type: Number,
        ref: 'offer'
    },
    coupon_id: {
        type: Object(Number),
        ref: 'coupon'
    },
    price: {
        type: Number
    },
    totalPrice: {
        type: Number
    },
    discountValue: {
        type: Number,
        default: 0
    },
    checkoutId: {
        type: String
    },
    paymentId: {
        type: String
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'FAILED', 'SUCCESSED', 'REFUNDED'],
    },
    deliveryInfo: {
        name: { type: String },
        email: { type: String },
        mobile: { type: String },
        address: { type: String },
        city: { type: String },
        country: { type: String },
        postcode: { type: String }
    }
    ,
    cart: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

orderSchema.plugin(mongooseI18n, { locales: ['ar', 'en'] });
orderSchema.plugin(paginate);

export default mongoose.model('order', orderSchema);
