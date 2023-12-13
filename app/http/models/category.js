const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = Schema({
    name : { type : String , required : true },
    slug : { type : String , required : true },
    parent : { type : Schema.Types.ObjectId , ref : 'Category' , default : null},
} , { timestamps : true , toJSON : { virtuals : true } });



module.exports = mongoose.model('Category' , categorySchema);