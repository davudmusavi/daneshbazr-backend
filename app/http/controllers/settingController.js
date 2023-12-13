const controller = require('./controller');
const Setting = require('../models/setting');


class settingCotroller extends controller {

    async getSetting(req, res) {
        let {id} = req.query;

        try {
            const info = await Setting.findById(id).exec();
            if(info) {
                res.json({
                    info : {
                        phone : info.phone,
                        payCode: info.payCode,
                        title: info.title
                    },
                    result : 'success',
                    status: 200,
                });
            }
            else {
                res.json({
                    error: "empty id",
                    status: 404,
                    result : 'error'
                }) 
            }

            
        } catch (error) {
            res.json({
                error: error,
                status: 400,
                result : 'error'
            })  
        }    

    }


    async update(req, res) {
        let {payCode, phone, title, id} = req.body;

        try {
            let update = await Setting.findByIdAndUpdate(id, {$set : {payCode, phone, title}});
            if(update) {
                res.json({
                    result : 'success',
                    status: 200,
                });
            }
            else {
                res.json({
                    massage: "متاسفانه چنین تنظیماتی موجود نیست",
                    status: 400,
                    result : 'error'
                })  
            }
        } catch (error) {
            res.json({
                error: error,
                status: 400,
                result : 'error'
            })  
        }
    }



}

module.exports = new settingCotroller();