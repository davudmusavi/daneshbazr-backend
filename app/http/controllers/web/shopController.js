const controller = require('../controller');
const jwt = require('jsonwebtoken');
const {UniqueOTP} = require('unique-string-generator');
const ZarinpalCheckout = require('zarinpal-checkout');
const sendRequest = require("send-request");

// DB
const Product = require('../../models/product');
const Member = require('../../models/member');
const Ostan = require('../../models/ostan');
const Shahr = require('../../models/shahr');
const Setting = require('../../models/setting');
const Order = require('../../models/order');


class shopController extends controller {

    async getBankToken(req, res) {
        let {Amount, callbackURL, invoiceID, terminalID} = req.body;

        const response = await sendRequest("https://sepehr.shaparak.ir:8081/V1/PeymentApi/GetToken", {
            method: "POST",
            body: {
                "Amount" : Amount,
                "callbackURL" : callbackURL ,
                "invoiceID" : invoiceID,
                "terminalID": terminalID,
            }
        });
        const result = JSON.parse(response.body)
        if(result.Status === 0) {
            res.json({
                payment: {
                    token: result.AccessToken
                },
                result : 'success',
                status: 200,
            })
        }
        else {
            res.json({
                payment: {
                    error: result.Status
                },
                message: "فعلا امکان اتصال به درگاه پرداخت ممکن نیست بعدا تلاش کنید.",
                result : 'error',
                status: 402,
            })
        }
    }   

    async getFreeSendPrice(req, res) {
        let setting = await Setting.findOne({ ID : 1 })
        if(setting) {
            res.json({
                post: setting.post,
                freeSend: setting.freeSend,
                result : 'success',
                status: 200,
            })
        }
        else {
            res.json({
                massage: "چیزی برای نمایش یافت نشد !",
                result : 'empty',
                status: 404,
            })
        }
    }

    async trackingOrder(req, res) {
            let {code, phone} = req.query
            
            try {
                let order = await Order.findOne({order_sku : code, member_phone : phone })
                if(order) {

                    let ostanName = await this.getOstan(order.member_address.ostan);
                    let cityName = await this.getCity(order.member_address.shahr);

                    res.json({
                        order: {
                            code: order.order_sku,
                            level: order.level,
                            ostanCity: ostanName + " ، " + cityName,
                            tracking_code: order.tracking_code,
                            // address: order.member_address.address,
                            // phone: order.member_address.phone,
                            name: order.member_address.name,
                            // date: order.date
                        },
                        result : 'success',
                        status: 200,
                    })
                }
                else {
                    res.json({
                        massage: "هیچ سفارشی با کد پیگیری شما ثبت نشده است !",
                        result : 'empty',
                        status: 404,
                    })
                }
            } catch (error) {
                res.json({
                    massage: error,
                    result : 'error',
                    status: 500,
                }) 
            }
    }  

    async paymentVerification(req, res) {
        let {token, authority, status} = req.body;

        let isValid = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(isValid) {
            let setting = await Setting.find({ ID : 1 })
            let order = await Order.find({zarinpal_authority: {$eq: authority}});
            if(order) {
                if(status == "OK") {
                    var zarinpal = ZarinpalCheckout.create(setting[0].payCode, false);
                    zarinpal.PaymentVerification({
                        Amount: order[0].order_cost + order[0].shipping_cost,
                        Authority: authority,
                    }).then(async response => {
                        if(response.status == 100 || response.status == 101) {
                            await Order.findByIdAndUpdate(order[0].id, {$set : {payment_tracking: response.RefID, payment_status: true}}); 
                            
                            order[0].products.map(async (item) => {
                                let pro = await Product.findOne({code : item.code});
                                if(pro) {
                                    await Product.findByIdAndUpdate(pro.id, {saleCount : pro.saleCount + item.quantity})
                                } 
                            })

                            res.json({
                                code: 100,
                                trackingCode: order[0].order_sku,
                                result : 'success',
                                status: 200,
                            })
                        } 
                        else {
                            res.json({
                                code: response.status,
                                result : 'error',
                                status: 500,
                            })
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    });
                }
            }
            else {
                res.json({
                    massage: "سفارشی برای شما یافت نشد !",
                    result : 'error',
                    status: 500,
                })
            }
        }
        else {
            res.json({
                massage: "مجوز دسترسی برای شما نامعتبر میباشد",
                result : 'error',
                status: 500,
            })
        }
    }

    async store(req, res) {
        // level ===> 1 new | 2 amade sazi | 3 ersal shode | 4 tahvil | 5 cancel 
        let orderCost = 0;
        let ersalCost = 0;
        let buyPrice = 0;

        let {ersal, token, items} = req.body;
        let isValid = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(isValid) {
            let setting = await Setting.find({ ID : 1 })
            let memberInfo = await Member.findById(isValid.member);    

            ersalCost = ersal === "post" ? setting[0].post : setting[0].tipax

            await Promise.all(items.map(async (item) => {
                const product = await Product.find({ code: {$eq : item.code} })
                product.map(async (pro) => {
                    if(item.pack === 1) {
                    const price = pro.discount > 0 ? (pro.price * pro.discount) / 100 : pro.price;
                    buyPrice += pro.buyPrice * item.quantity; 
                    orderCost += price * item.quantity;
                    }
                    else if(item.pack === 2) {
                    const price = pro.faale_price * item.weight
                    const bprice = pro.faale_buy_price * item.weight
                    orderCost += price * item.quantity;
                    buyPrice +=  bprice * item.quantity;
                    }
                    else {
                        pro.cans.forEach(element => {
                            if(element.weight == item.weight) {
                                orderCost += element.price * item.quantity;
                                buyPrice +=  element.buyPrice * item.quantity;
                            }
                        });
                    }
                })
            }))

            let newOrder = new Order({
                order_sku: UniqueOTP(6),
                level: 1,
                date: Date.now(),
                member: isValid.member,
                member_address: {
                    name : memberInfo.name +" "+ memberInfo.family,
                    address : memberInfo.address,
                    ostan: memberInfo.ostan,
                    shahr: memberInfo.city,
                    phone: memberInfo.phone,
                    posti: memberInfo.codePosti,
                },
                member_phone: memberInfo.phone,
                products: items,
                shipping_cost: ersalCost,
                shipping_type: ersal,
                order_cost: orderCost,
                order_buy_cost : buyPrice,
                tracking_code: 0,
                payment_status: false,
                payment_tracking: 0,
                zarinpal_authority: 0,
            })

            let result = await newOrder.save();
            if(result) {
                var zarinpal = ZarinpalCheckout.create(setting[0].payCode, false);
                zarinpal.PaymentRequest({
                    Amount: orderCost + ersalCost,
                    CallbackURL: 'https://daneshbazr.com/checkout/payment',
                    Description: 'پرداخت هزینه سفارش' + memberInfo.name +" "+ memberInfo.family,
                    Email: '',
                    Mobile: memberInfo.phone,
                }).then(async function (response) {
                    if (response.status === 100) {
                        await Order.findByIdAndUpdate(result.id, {$set : {zarinpal_authority: response.authority}}); 
                        res.json({
                            authority : response.authority,
                            result : 'success',
                            status: 201,
                        })
                    }
                }).catch(err => {
                    res.json({
                        massage: err,
                        result : 'error',
                        status: 500,
                    })
                });
            }
            else {
                console.log("error");
            }
        }
        else {
            res.json({
                massage: "مجوز دسترسی برای شما نامعتبر میباشد",
                result : 'error',
                status: 500,
            })
        }
    }  

    async updateMemberInfo(req, res) {
        let {token, name, family, address, city, ostan, phone, posti, ostanText , cityText } = req.body;

        try {
            let isValid = jwt.verify(token, process.env.JWT_SECRET_KEY);
            if(isValid) {
                await Member.findByIdAndUpdate(isValid.member, {
                    name,
                    family,
                    address,
                    phone,
                    codePosti: posti,
                    cityText,
                    ostanText,
                    city,
                    ostan
                });
                res.json({
                    result : 'success',
                    status: 200,
                })
            }
            else {
                res.json({
                    massage: "مجوز دسترسی برای شما نامعتبر میباشد",
                    result : 'error',
                    status: 500,
                })
            }
        } catch (error) {
            res.json({
                massage: error,
                result : 'error',
                status: 500,
            })
        }

    }  

    async getShopInfo(req, res) {
        let {token} = req.body
        let allOstan = await this.getAllOstan();
        
        try {
            let isValid = jwt.verify(token, process.env.JWT_SECRET_KEY);
            if(isValid) {
                let member = await Member.findById(isValid.member);
                let ostanName = await this.getOstan(member.ostan);
                let cityName = await this.getCity(member.city);

                let setting = await Setting.find();

                res.json({
                    address: {
                        name: member.name,
                        family: member.family,
                        ostan: ostanName,
                        city_ostan: member.city_ostan,
                        shahr: cityName,
                        shahr_id: member.city,
                        address: member.address,
                        code_posti: member.codePosti,
                        phone: member.phone,
                    },
                    ostans: allOstan,
                    shippingCost: {
                        tipax: setting[0].tipax,
                        post: setting[0].post
                    },
                    result : 'success',
                    status: 200,
                })
            }
            else {
                res.json({
                    massage: "مجوز دسترسی برای شما نامعتبر میباشد",
                    result : 'error',
                    status: 500,
                    ostans: allOstan,
                })
            }
        } catch (error) {
            res.json({
                massage: error,
                result : 'error',
                status: 500,
                ostans: allOstan,
            })
        }

    }

    async getAllShahr(req, res) {
        let {ostan} = req.query;
        try {
            let shahrs = await Shahr.find({city_ostan : {$eq : ostan}});
            if(shahrs.length > 0) {
                res.json({
                    list: this.filterShahrsData(shahrs),
                    result : 'success',
                    status: 200,
                })
            }
            else {
                res.json({
                    massage: "شهری برای ایدی وارد شده یافت نشد.",
                    result : 'empty',
                    status: 404,
                })
            }
        } catch (error) {
            res.json({
                massage: error,
                result : 'error',
                status: 500,
            })
        }
    } 

    filterShahrsData(shahr) {
        return shahr.map(sh => {
            return {
                id : sh.id,
                name : sh.city_name,
            }
        })
    }

    async getAllOstan() {
        let ostan = await Ostan.find()
        return ostan.map(os => {
            return {
                id : os.id,
                name : os.ostan_name,
                pid: os.ostan_pid
            }
        })
    }

    async getOstan(ostan) {
        let res = await Ostan.find({ostan_pid : {$eq : ostan}});
        return res[0].ostan_name
    }

    async getCity(city) {
        let name = await Shahr.findById(city)
        return name.city_name
    }

}
module.exports = new shopController();