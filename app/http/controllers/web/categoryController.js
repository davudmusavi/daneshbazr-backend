const controller = require('../controller');

// DB
const Category = require('../../models/category');
const Product = require('../../models/product');

class menuCotroller extends controller {

    async getMenuList(req, res) {
        let list = await Category.find({parent : null});
        res.json({
            category : this.filterCategoryData(list),
            result : 'success',
            status: 200,
        })
    }

    async getCategory(req, res) {
        let {cat, sort, page} = req.query;

        // if(sort === "") {
        //     sort = "new";
        // }

        // if(page === "") {
        //     page = 1;
        // }


        try {
            let catSlug = await Category.find({slug : cat});
            let myQuery;
            let condition = {};

            if(catSlug.length > 0) {

                if(sort === "omde") {
                    condition['faale'] = true
                }

                if(sort === "can") {
                    condition['cans'] = {$gt: {$size: 1}}
                }

                myQuery = { 
                    $and: [
                        {
                            $or: [
                                { category_main: { $eq: catSlug[0].id } },
                                { category_child: { $eq: catSlug[0].id } }
                            ]
                        },
                        condition
                    ]
                }

                let products = await Product.paginate( myQuery , { page , sort : this.getSort(sort) , limit : 15 });

                    res.json({
                        product:  this.filterProductData(products) ,
                        category: {
                            name: catSlug[0].name,
                        },
                        result : 'success',
                        status: 200,
                    })
       
            }
            else {
                res.json({
                    massage : "دسته مورد نظر یافت نشد !",
                    result : 'error',
                    status: 404,
                })
            }
        } 
        catch (error) {
            res.json({
                massage : error,
                result : 'error',
                status: 403,
            })
        }
    }


    filterCategoryData(cat) {
        return { 
            menu : cat.map(category => {
                return {
                    id : category.id,
                    name : category.name,
                    slug: category.slug
                }
            })
        }
    }


    filterProductData(product) {
        return { 
            ...product,
            docs : product.docs.map(pro => {
                return {
                    id : pro._id,
                    name : pro.name,
                    slug: pro.slug,
                    discount: pro.discount,
                    property: pro.property,
                    country: this.getProductCountry(pro.country),
                    sku: pro.code,
                    price: pro.discount > 0 ? pro.price - (pro.price * pro.discount / 100) : pro.price,
                    old_price: pro.discount > 0 ? pro.price : 0,
                    seedCount: pro.seedCount,
                    image: pro.images[0].image,
                    weight: pro.weight,
                    faale: pro.faale,
                    faale_lowest: pro.faale_lowest,
                    faale_price: pro.faale_price,
                    cans: pro.cans,
                    gallery: this.getProductGallery(pro.images),
                    explanation: pro.explanation == "" ? "" : pro.explanation
                }
            })
        }
    }
    
    getProductCountry(number) {
        let name = '';
        if(number == 1) name = 'ایران'; 
        else if(number == 2) name = 'آمریکا'; 
        else if(number == 3) name = 'ترکیه'; 
        else if(number == 4) name = 'ژاپن'; 
        else if(number == 5) name = 'هلند'; 
        else if(number == 6) name = 'ایتالیا'; 
        else if(number == 7) name = 'فرانسه'; 
        else if(number == 8) name = 'هند'; 
        else name

        return name
    }

    getProductGallery(images) {
        const gallery = [];
        images.map(img => {
            gallery.push(img.image)
        })
        return gallery;
    }

    getSort(sort) {
        if(sort === "new") {
            return {}
        }
        else if(sort === "lowerPrice") {
            return {price : 1}  
        }
        else if(sort === "higherPrice") {
            return {price : -1}  
        }
    }

}

module.exports = new menuCotroller();

