const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ostanSchema = Schema({
    ostan_name : { type : String , required : true },
    ostan_pid : { type : Number , required : true }
} 
, { timestamps : true , toJSON : { virtuals : true } });


module.exports = mongoose.model('Ostan' , ostanSchema);