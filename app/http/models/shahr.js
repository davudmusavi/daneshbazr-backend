const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShahrSchema = Schema({
    city_name : { type : String , required : true },
    city_ostan : { type : Number , required : true }
} 
, { timestamps : true , toJSON : { virtuals : true } });


module.exports = mongoose.model('Shahr' , ShahrSchema);