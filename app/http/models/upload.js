const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const uploadSchema = Schema({
    name : { type : String , required : true },
    type : { type : String , required : true },
    tag : { type : String , required : true },
} , { timestamps : true , toJSON : { virtuals : true } });

uploadSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Media' , uploadSchema);