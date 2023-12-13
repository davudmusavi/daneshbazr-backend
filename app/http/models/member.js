const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const memberSchema = Schema({
    name : { type : String , required : true },
    family : { type : String , required : true },
    city : { type: Schema.Types.ObjectId , ref : 'Shahr' , required : false },
    cityText : { type : String, required : false },
    ostan : { type : Number, required : false, default: 0 },
    ostanText : { type : String, required : false },
    email : { type : String , required : false },
    phone : { type : String , required : true },
    codePosti : { type : Number , required : true, default: 0 },
    address : { type : String , required : true },
    // orderCount : { type : Number , required : false },
    code : { type : Number , required : false },
} 
, { timestamps : true , toJSON : { virtuals : true } });

memberSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Member' , memberSchema);