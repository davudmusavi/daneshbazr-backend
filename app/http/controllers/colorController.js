const controller = require('./controller');
const Color = require('../models/color');

class colorCotroller extends controller {

    // new color
    async store(req, res) {
        const {code , name} = req.body;
        let newColor = new Color({ 
            name: name,
            code: code,
        });
        await newColor.save(); 
        res.json({
            "result": "success",
            "status": 201
        });
    }

    async colorList(req, res) {
        try {
            let color = await Color.find();
            res.json({
                list : this.filterColorData(color),
                result : 'success',
                status: 200,
            });
        } 
        catch (error) {
            res.json({
                error: error,
                status: 400,
                result : 'error'
            })
        }
    }

    // filter color output
    filterColorData(color) {
        return { 
            colors : color.map(color => {
                return {
                    id : color.id,
                    name : color.name,
                    code : color.code
                }
            })
        }
    }


    async destroy(req , res  , next) {
        try {
            let {id} = req.params; 
            let color = await Color.findById(id).exec();
            if(!color) {
                res.json({
                    massage: "رنگی با شناسه ارسال شده یافت نشد.",
                    result : 'error',
                    status: 404,
                })
            }

            color.deleteOne();
            res.json({
                result : 'success',
                status: 200,
            })
        } 
        catch (error) {
            next(error);
        }
    }

}

module.exports = new colorCotroller();


