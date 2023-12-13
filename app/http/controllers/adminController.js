const controller = require('./controller');
const jwt = require('jsonwebtoken');
var moment = require('moment-jalaali')
moment.loadPersian();
require('moment/locale/fa')


const Admin = require('../models/admin');
const Order = require('../models/order');
const Member = require('../models/member');
const Product = require('../models/product');
const Contact = require('../models/contact');


let hidden = {__v: 0, createdAt: 0, updatedAt: 0}

class adminCotroller extends controller {

    async contactList(req, res) {
        let {sort} = req.query;
        const contactNew = await Contact.find({visit: false}).count();
        const contactOld = await Contact.find({visit: true}).count();

        try {
            const contact = await Contact.find({visit: sort === "new" ? false : true}, {__v: 0, updatedAt: 0 })
            res.json({
                contact,
                count: {
                    new: contactNew,
                    old: contactOld
                },
                result : 'success',
                status: 200,
            })
        } 
        catch (error) {
            res.json({
                count: {
                    new: contactNew,
                    old: contactOld
                },
                error: error,
                status: 400,
                result : 'error'
            })
        }
    }

    async memberAllInfo(req, res) {
        const {memberID} = req.query;
        let newHidden = {...hidden, city: 0, ostan: 0, code: 0}

        try {
            const member = await Member.findOne({_id : memberID}, newHidden )
            const orders = await Order.find({member: memberID}, {order_sku: 1, date:1, order_cost: 1, level: 1, payment_status: 1 })
            res.json({
                member,
                orders,
                result : 'success',
                status: 200,
            })
        } 
        catch (error) {
            res.json({
                error: error,
                status: 400,
                result : 'error'
            })
        }
    }   

    async adminList(req, res) {
        try {
            let admins = await Admin.find();
            res.json({
                admins : this.filterAdminData(admins),
                result : 'success',
                status: 200,
            })
        } 
        catch (err) {
            res.json({
                error: err,
                status: 400,
                result : 'error'
            })
        }
    }

    async memberList(req, res) {
        let page = req.query.page || 1;

        try {
            let list = await Member.paginate({} , { page , limit : 15 });

            res.json({
                member : this.filterMemberData(list),
                result : 'success',
                status: 200,
            })
        } catch (error) {
            res.json({
                message: error,
                status: 400,
                result : 'error'
            })
        }

    }   

    // filter member output
    filterMemberData(member) {
        let n = 0;
        return { 
            ...member,
            docs : member.docs.map(me => {
                return {
                    rowID: ++n,
                    id : me._id,
                    name : me.name,
                    family : me.family,
                    phone: me.phone,
                    ostan: me.ostanText,
                    shahr: me.cityText,
                    posti: me.codePosti
                }
            })
        }
    }
    // filter admin output
    filterAdminData(admins) {
        return { 
            list : admins.map(admin => {
                return {
                    id : admin.id,
                    name : admin.name + " " +admin.family,
                    email: admin.email,
                    role: admin.role,
                    massage: 29,
                    posts: 65,
                    profileImage: "",
                    active: admin.active
                }
            })
        }
    }

     // new admin
    async store(req, res) {
        const {email , password, firstName, lastName, role} = req.body;

        let newUser = new Admin({ 
            name: firstName,
            family: lastName,
            email: email,
            role: role,
            active: 1
         });
        newUser.$set({ password : newUser.hashPassword(password) });
        await newUser.save(); 

        res.json({
            "result": "success",
            "status": 201
        });
    }

    // admin login
    async login(req, res) {
        const {email , password} = req.query;
        Admin.findOne({ email: email}).then((data) => {
            if(! data || ! data.comparePassword(password)) {
                res.json({
                    "result": "no-success",
                    "status": 404
                });
            }
            else {
                let jwtSecretKey = process.env.JWT_SECRET_KEY;
                // create token
                const token = jwt.sign({ hash : data._id } , jwtSecretKey , {
                    expiresIn : "4h"
                });
                res.json({
                    "token": token,
                    "result": "success",
                    "status": 200
                });
            }
        }).catch((err) => {
            res.json({
                "result": "no-success",
                "status": 400,
                "error": err
            });
        });
    }

    async checkToken(req, res) {
        let token = req.headers['x-access-token'];
        try {
            let jwtDecode = jwt.verify(token, process.env.JWT_SECRET_KEY);
            if(jwtDecode) {
                let admin = await Admin.findById(jwtDecode.hash);
                let newOrder = await Order.find({ payment_status: true, level: 1 }).count();
                let newContact = await Contact.find({ visit: false }).count();

                res.json({
                    admin: {
                        name: admin.name,
                        family: admin.family,
                        role: admin.role,
                    },
                    bage: {
                        order: newOrder,
                        contact: newContact
                    },
                    result : 'success',
                    status: 200,
                })
            }
        } 
        catch (err) {
            res.json({
                massage: "مجوز دسترسی برای شما نامعتبر میباشد",
                result : 'error',
                status: 500,
            })
        }
    }

    async updateActive(req, res, next) {
        try {
            const {id, val} = req.params;
            let inverse;
            if(val == 1) inverse = 0;
            else inverse = 1 
           
            await Admin.findByIdAndUpdate(id , { $set : { active : inverse }})
            res.json({
                "result": "success",
                "status": 200
            });
        } catch(err) {
            next(err);
        }
    }

    async updatePassword(req, res, next) {
        try {
            const {id, password} = req.params;

            let user = await Admin.findOne({ _id : id });
            user.$set({ password : user.hashPassword(password) })
            let r = await user.save();
            if(r) {
                res.json({
                    "result": "success",
                    "status": 200
                });
            }
            else {
                res.json({
                    "massage": "مشکلی در انجام عملیات تغییر رمز عبور به وجود آمد.",
                    "result": "error",
                    "status": 400
                });
            }
        } catch (error) {
            next(error)
        }
    }

    async destroy(req , res  , next) {
        try {
            let {id} = req.params; 
            let admin = await Admin.findById(id).exec();
            if(!admin) {
                res.json({
                    massage: "مدیری با شناسه ارسال شده یافت نشد.",
                    result : 'error',
                    status: 404,
                })
            }
            admin.deleteOne();
            res.json({
                result : 'success',
                status: 200,
            })
        } 
        catch (error) {
            next(error);
        }
    }

    async removeContact(req , res  , next) {
        try {
            let {id} = req.query; 
            let admin = await Contact.findByIdAndDelete(id)
            if(!admin) {
                res.json({
                    massage: "کاربری با شناسه ارسال شده یافت نشد.",
                    result : 'error',
                    status: 404,
                })
            }

            res.json({
                result : 'success',
                status: 200,
            })
        } 
        catch (error) {
            next(error);
        }
    }
    async destroyUser(req , res  , next) {
        try {
            let {id} = req.params; 
            let admin = await Member.findById(id).exec();
            if(!admin) {
                res.json({
                    massage: "کاربری با شناسه ارسال شده یافت نشد.",
                    result : 'error',
                    status: 404,
                })
            }
            admin.deleteOne();
            res.json({
                result : 'success',
                status: 200,
            })
        } 
        catch (error) {
            next(error);
        }
    }

    async getDashboardInfo(req, res) {
        let totalIncome = 0;
        var currentDate = new Date()
        var lastMonthDate = new Date(currentDate.setMonth(currentDate.getMonth() -1 ));

        let newOrder = await Order.find({ payment_status: true, level: 1 })
        let okeyOrder = await Order.find({ payment_status: true, level: 4, date: { $gt: lastMonthDate}}).count()
        let totalSales = await Order.find({ payment_status: true, level: 4 });
        totalSales.map((item) => totalIncome += item.order_cost)
        let customers = await Member.find().count()
        let products = await Product.find().count()


        res.json({
            info: {
                allVisit: 400000,
                todayVisit: 2584,
                yesterdayVisit: 5472,
                mobile: 46,
                desktop: 44,
                customers: customers,
                products: products,
                totalSales: totalIncome,
                newOrder: newOrder.length,
                orderTarget: 500,
                orderOnComplate: 500 - okeyOrder,
                salesMonth: okeyOrder
            },
            newOrder: this.filterOrderData(newOrder),
            day: this.daysAgo(),
            dayValue: [15, 125, 152, 840, 941, 670, 72],
            result : 'success',
            status: 200,
        })
    }

    async updateContact(req, res, next) {
        let {id} = req.query;
        try {
            await Contact.findByIdAndUpdate(id, {visit: true});
            res.json({
                result : 'success',
                status: 200,
            })
        } catch (error) {
            next(error)
        }
    }

    daysAgo() {
        moment.loadPersian()
        let daysAgo = []
        for(var i=0; i <= 6; i++) {
          daysAgo[i] = moment().subtract(i, 'month').format("l")
        }
        return daysAgo
    }
    
    filterOrderData(order) {
        let n = 0;
        return { 
            items : order.map(or => {
                return {
                    id: ++n,
                    code: or.order_sku,
                    name: or.member_address.name,
                    date: moment(or.date).format('jYYYY/jM/jD'),
                    cost: or.order_cost,
                    payment: or.payment_status
                }
            })
        }
    }

}

module.exports = new adminCotroller();