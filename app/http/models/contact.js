const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = Schema({
    name: {type: String, required: true},
    phone : { type : String , required : true }, 
    email : { type : String , required : true },
    text : { type : String , required : true },
    visit: {type: Boolean, required: true}
} 
, { timestamps : true , toJSON : { virtuals : true } });

module.exports = mongoose.model('Contact' , contactSchema);