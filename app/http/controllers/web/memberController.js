const controller = require('../controller');
const jwt = require('jsonwebtoken');

// DB
const Member = require('../../models/member');
const Order = require('../../models/order');
const Contact = require('../../models/contact');

class memberController extends controller {

    async store(req, res) {
        let newMember = new Member({
            name: "davud",
            family: "musavi",
            city: 1,
            ostan: 21,
            email: "davudmusavi1369@gmail.com",
            phone: "09146645521",
            codePosti: "5335146496",
            address: "ترکمنچای خ امام کوچه غدیر"
        })

        newMember.save();
        res.json({
            result : 'success',
            status: 201,
        })
    }

    async login(req, res) {
        let {number} = req.query;
        const min = 11111;
        const max = 99999;
        const random = Math.floor(Math.random() * (max - min + 1)) + min;

        try {
            let member = await Member.find({phone : {$eq : number}});
            if(member.length > 0) {
                await Member.findByIdAndUpdate(member[0].id , { $set : { code : random }})
                res.json({
                    rand: random,
                    result : 'success',
                    status: 200,
                })
            }
            else {
               let newMember = new Member({
                    name: " ",
                    family: " ",
                    phone: number,
                    codePosti: 0,
                    address: " ",
                    code: random
                })
               let x = newMember.save();
               res.json({
                    rand: random,
                    result : 'success',
                    status: 201,
               })
            }
        } catch (error) {
            res.json({
                massage: error,
                result : 'error',
                status: 404,
            })
        }
    }
    
    async verify(req, res) {
        let {code} = req.query;
        
        try {
            let member = await Member.find({code : {$eq : code}});
            if(member.length > 0) {
                let jwtSecretKey = process.env.JWT_SECRET_KEY;
                // create token
                const token = jwt.sign({ member : member[0].id } , jwtSecretKey , {
                    expiresIn : "4h"
                });

                res.json({
                    member: {
                        name: member[0].name == " " ? member[0].phone : member[0].name,
                        phone: member[0].phone,
                        token: token
                    },
                    result : 'success',
                    status: 200,
                }) 

            }
            else {
                res.json({
                    massage: "کد ارسال شده معتبر نیست",
                    result : 'error',
                    status: 404,
                })
            }
        } catch (error) {
            res.json({
                massage: error,
                result : 'error',
                status: 404,
            }) 
        }
    }

    async checkToken(req, res) {
        let {token} = req.body;
        
        try {
            let isValid = jwt.verify(token, process.env.JWT_SECRET_KEY);
            if(isValid) {
                let member = await Member.findById(isValid.member);
                if(member) {
                    res.json({
                        name: member.name == " " || member.name == "" ? member.phone : member.name,
                        result : 'success',
                        status: 200,
                   })
                }
                else {
                    res.json({
                        result : 'notfound',
                        status: 404,
                    })
                }
            }
            else {
                res.json({
                    result : 'expired',
                    status: 400,
                })
            }

        } catch (error) {
            res.json({
                result : 'error',
                status: 404,
            })
        }
    }

    async storeContactUs(req, res) {
        let {name, email, phone, text} = req.body;

        let newContact = new Contact({name, phone, text, email, visit: false})
        let result = newContact.save();
        if(result) {
            res.json({
                result : 'success',
                status: 201,
            })
        }
        else {
            res.json({
                message: "امکان ثبت پیغام وجود ندارد",
                result : 'error',
                status: 400,
            }) 
        }
    }

    async getAccountDetail(req, res) {
        let {user, order} = req.query;

        let isValid = jwt.verify(user, process.env.JWT_SECRET_KEY);
        if(isValid) {

            let member = await Member.findById(isValid.member, {name:1, family: 1, phone: 1, codePosti: 1, address: 1 });
            if(member) {
                if(order) {
                    let orders = await Order.find({member : member._id}, {order_sku:1, date: 1, level:1, payment_status: 1});
                    res.json({
                        orders,
                        data: member,
                        result : 'success',
                        status: 200,
                    })
                }
                else {
                    res.json({
                        data: member,
                        result : 'success',
                        status: 200,
                    })
                }
            }
            else {
                res.json({
                    result : 'notfound',
                    status: 404,
                })
            }
        }
        else {
            res.json({
                result : 'expired',
                status: 400,
            })
        }
    }

    async updateMemberData(req, res) {
        let {name, address, family, codePosti, id} = req.body;

        try {
            await Member.findByIdAndUpdate(id, {name, family, address, codePosti});
            res.json({
                result : 'success',
                status: 200,
            })
          
        } 
        catch (error) {
            res.json({
                massage: error,
                result : 'error',
                status: 500,
            })
        }

        
    }

    async orderInfo(req, res) {
        let {user, order} = req.query;

        try {
            let isValid = jwt.verify(user, process.env.JWT_SECRET_KEY);
            if(isValid) {
                let orderInfo = await Order.findOne({order_sku : order}, {__v:0, zarinpal_authority:0, updatedAt:0, createdAt: 0});
                let member = await Member.findById(isValid.member, {name:1, family: 1, phone: 1, codePosti: 1, address: 1 });
                if(orderInfo) {
                    res.json({
                        order: orderInfo,
                        member,
                        result : 'success',
                        status: 200,
                    })
                }
                else {
                    res.json({
                        result : 'notFound',
                        status: 404,
                    })
                }
            }
            else {
                res.json({
                    result : 'notFound',
                    status: 400,
                })
            }
        } 
        catch (error) {
            res.json({
                result : 'error',
                status: 400,
            })
        }
    }

}
module.exports = new memberController();