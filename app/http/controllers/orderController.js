const controller = require('./controller');
var moment = require('moment-jalaali')
moment.loadPersian();
require('moment/locale/fa')

const Order = require('../models/order');
const Ostan = require('../models/ostan');
const Shahr = require('../models/shahr');

class orderController extends controller {
    // level ===> 1 new | 2 amade sazi | 3 ersal shode | 4 tahvil | 5 cancel 

    async getOrder(req, res) {
        let {sort} = req.query;
        let where = {}
        let AllPrice = 0;
        let AllBuyPrice = 0;
       
        if(sort < 5) {
            where = {payment_status: true, level: sort }
        }
        else where = {payment_status: false}

        try {
            let orders = await Order.find( where )
            let AllOrder = await Order.find({payment_status: true})
            if(AllOrder) {
                AllOrder.map((item) => {
                    AllPrice += item.order_cost;
                    AllBuyPrice += item.order_buy_cost;
                })
            }
        
            if(orders.length > 0) {
                res.json({
                    counter: {
                        new: await this.getOrderLevel(1),
                        amade: await this.getOrderLevel(2),
                        ersal: await this.getOrderLevel(3),
                        tahvil: await this.getOrderLevel(4),
                        cancel: await this.getOrderLevel(5),
                        buyPrice : AllPrice - AllBuyPrice,
                        AllOrder: AllOrder.length,
                        AllPrice
                    },
                    orders: this.filterOrderData(orders),
                    result : 'success',
                    status: 200,
                })
            }
            else {
                res.json({
                    counter: {
                        new: await this.getOrderLevel(1),
                        amade: await this.getOrderLevel(2),
                        ersal: await this.getOrderLevel(3),
                        tahvil: await this.getOrderLevel(4),
                        cancel: await this.getOrderLevel(5),
                        AllOrder: AllOrder.length,
                        AllPrice
                    },
                    message: "سفارشی برای این مرحله یافت نشد !",
                    result : 'empty',
                    status: 404,
                })
            }

        } catch (error) {
            res.json({
                counter: {
                    new: await this.getOrderLevel(1),
                    amade: await this.getOrderLevel(2),
                    ersal: await this.getOrderLevel(3),
                    tahvil: await this.getOrderLevel(4),
                    cancel: await this.getOrderLevel(5),
                    AllOrder: AllOrder.length,
                    AllPrice
                },
                message: "متاسفانه اشکالی در انجام عملیات وجود دارد",
                result : 'error',
                status: 400,
            })
        }
    }

    async getOrderAllInfo(req, res) {
        let {code} = req.query;
        let info = await Order.findOne({order_sku : code})

        if(info) {
            res.json({
                info: {
                    member: {
                        name: info.member_address.name,
                        address: info.member_address.address,
                        ostan: await this.getOstan(info.member_address.ostan),    
                        shahr: await this.getCity(info.member_address.shahr),
                        phone: info.member_address.phone,
                        posti: info.member_address.posti,
                        id: info.member    
                    },
                    id: info.id,
                    code: info.order_sku,
                    payment_status: info.payment_status,
                    payment_tracking: info.payment_tracking,
                    cost: info.order_cost,
                    tracking_code: info.tracking_code,
                    shipping_cost: info.shipping_cost,
                    shipping_type: info.shipping_type === "tipax" ? "تیپاکس" : "پست پیشتاز",
                    level: info.level,
                    products: info.products,
                    date: info.createdAt
                },
                result : 'success',
                status: 200,
            }) 
        }
        else {
            res.json({
                message: "متاسفانه هیچ سفارشی با کد شما یافت نشد",
                result : 'empty',
                status: 404,
            })
        }
       
    }

    async updateOrderLevel(req, res) {
        const {order, level} = req.body;
        let update = await Order.findByIdAndUpdate(order, {$set : {level, }});
        if(update) {
            res.json({
                result : 'success',
                status: 200,
            })
        }
        else {
            res.json({
                message: "متاسفانه مشکلی در انجام عملیات وجود دارد",
                result : 'error',
                status: 400,
            })
        }
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
                    payment: or.payment_status,
                    ship: or.shipping_type == "tipax" ? "تیپاکس" : "پست پیشتاز"
                }
            })
        }
    }

    async updateOrderPostCode(req, res) {
       let {id, code} = req.body

       try {
            await Order.findByIdAndUpdate(id, {tracking_code : code})
            res.json({
                result : 'success',
                status: 200,
            })
       } catch (error) {
            res.json({
                message: "متاسفانه مشکلی در انجام عملیات وجود دارد",
                result : 'error',
                status: 400,
            })
       }
    }

    async getOrderLevel(level) {
        let where = {}
        if(level < 5) {
            where = {payment_status: true, level: level }
        }
        else where = {payment_status: false}

        let order = await Order.find(where).count();
        return order
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

module.exports = new orderController();