const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt');


const adminSchema = Schema({
    name : { type : String , required : true },
    family : { type : String , default : false },
    email : { type : String , unique : true, required : true},
    password : { type : String , required : true },
    role : { type : Number , required : true},
    active : { type : Number , required : true},
} , { timestamps : true , toJSON : { virtuals : true } });


adminSchema.methods.hashPassword = function(password) {
    let salt = bcrypt.genSaltSync(15);
    let hash = bcrypt.hashSync(password , salt);

    return hash;
}

adminSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password , this.password);
}




module.exports = mongoose.model('Admin' , adminSchema);