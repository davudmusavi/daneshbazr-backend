const controller = require('./controller');
const Category = require('../models/category');

class categoryCotroller extends controller {

    // new category
    async store(req, res) {
        const {name , slug, category} = req.body;

        let newCategory = new Category({ 
            name: name,
            slug: this.slug(slug),
            parent: category == "none" || category == 0 ? null : category
        });
        await newCategory.save(); 
        res.json({
            "result": "success",
            "status": 201
        });
    }

    slug(slug) {
        return slug.replace(/([^۰-۹آ-یa-z0-9]|-)+/g , "-")
    }

    async list(req, res) {
        let {id} = req.params; 
        let ID = id == 0 ? null : id

        try {
            let category = await Category.find({parent : ID})
            res.json({
                data : this.filterCategoryData(category),
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

    // filter category output
    filterCategoryData(cat) {
        return { 
            category : cat.map(category => {
                return {
                    id : category.id,
                    name : category.name,
                    slug: category.slug
                }
            })
        }
    }


    async destroy(req , res  , next) {
        try {
            let {id} = req.params; 
            let cat = await Category.findById(id).exec();
            if(!cat) {
                res.json({
                    massage: "دسته ای با شناسه ارسال شده یافت نشد.",
                    result : 'error',
                    status: 404,
                })
            }
            cat.deleteOne({});
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

module.exports = new categoryCotroller();