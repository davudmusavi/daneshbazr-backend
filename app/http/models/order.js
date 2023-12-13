const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');


const orderSchema = Schema({
    order_sku : { type : String , required : true }, // کد پیگیری سفارش مشتری
    level: {type: Number, require: true},
    date: {type: Date, required: true},
    member : { type : Schema.Types.ObjectId , ref : 'Member'},
    member_address: {type: Object, required: true},
    member_phone: {type: String, required: false},
    products : {type: Array, required : true},
    shipping_cost : {type: Number, required: true}, // هزینه ارسال
    shipping_type : {type: String, required: true}, // نحوه ارسال
    order_cost : {type: Number, required: true}, // هزینه کل سفارش بدون هزینه ارسال
    order_buy_cost : {type: Number, required: true}, // مبلغ کل محصولات (قیمت خرید)
    tracking_code : {type: String, required: false}, //  کد پیگیری مرسوله
    payment_status : {type: Boolean, required: true}, // وضعیت پرداخت
    payment_tracking: {type: Number, require: false}, // کد پیگیری پرداخت بانکی 
    zarinpal_authority: {type: String, require: false},
} 
, { timestamps : true , toJSON : { virtuals : true } });

orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Order' , orderSchema);