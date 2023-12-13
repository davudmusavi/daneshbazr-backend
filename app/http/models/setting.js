const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingSchema = Schema({
    ID : {type: Number, required: true, default: 1 }, 
    title : { type : String , required : true },
    freeSend: { type: Number, require: true },
    phone : { type : String , required : true },
    payCode : { type : String , required : true },
    tipax: {type: Number, required: false},
    post: {type: Number, required: false},
} 
, { timestamps : true , toJSON : { virtuals : true } });

module.exports = mongoose.model('Setting' , settingSchema);