const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');


const productSchema = Schema({
    name : { type : String , required : true },
    slug : { type : String , required : true }, // آدرس صفحه
    code : { type : String , required : true }, // کد محصول
    stock : { type : Number , required : true }, // موجودی
    price : { type : Number , required : true },
    buyPrice : { type : Number , required : true },
    discount : { type : Number , required : false },
    weight : { type : Number , required : false },
    images : { type : Object , required : true },
    colors : { type : Object , required : false },
    faale : { type : Boolean , required : false },
    faale_lowest : { type : Number , required : false },
    faale_price : { type : Number , required : false },
    faale_buy_price : { type : Number , required : false },
    faale : { type : Boolean , required : true },
    cans: [{type: Object, require: false}],
    seedCount : { type : Number , required : false },
    country : { type : Number , required : true }, // کشور
    explanation : { type : String , required : false }, // توضیح کالا
    property : { type : String , required : false }, // مشخصات - ویژگی ها
    status : { type : Number , required : true , default : 1}, // وضعیت | 1 == ok - 0 == nook
    viewCount : { type : Number , default : 0 }, // تعداد بازدید
    saleCount : { type : Number , default : 0 }, // تعداد فروش
    category_main : { type : Schema.Types.ObjectId , ref : 'Category'},
    category_child : { type : Schema.Types.ObjectId , ref : 'Category', require : false },
    admin : { type : Schema.Types.ObjectId , ref : 'Admin'}, // مدیر نویسنده پست
} 
, { timestamps : true , toJSON : { virtuals : true } });

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product' , productSchema);