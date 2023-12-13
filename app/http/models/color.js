const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const colorSchema = Schema({
    name : { type : String , required : true },
    code : { type : String , required : true },
} , { timestamps : true , toJSON : { virtuals : true } });

module.exports = mongoose.model('Color' , colorSchema);