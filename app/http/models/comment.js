const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = Schema({
    member : { type : Schema.Types.ObjectId , ref : 'Member'},
    name: {type: String, required: true},
    product : { type : Schema.Types.ObjectId , ref : 'Product'},
    text : { type : String , required : true }, 
    title : { type : String , required : true },
    active : { type : Boolean , required : true },
} 
, { timestamps : true , toJSON : { virtuals : true } });


module.exports = mongoose.model('Comment' , commentSchema);