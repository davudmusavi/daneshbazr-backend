const controller = require('../controller');
const jwt = require('jsonwebtoken');
const moment = require('moment-jalaali')

// DB
const Product = require('../../models/product');
const Comment = require('../../models/comment');
const Member = require('../../models/member');

class productCotroller extends controller {


    async getProductData(req, res) {
        let {sku} = req.query;

        try {
            let product_info = await Product.find({code : {$eq : sku}})

            // similar 
            let similar = await Product.find({category_main: {$eq : product_info[0].category_main}}).limit(20) 

            // comments 
            let comments = await Comment.find({product: product_info[0].id, active: true}) 

            if(product_info) {
                res.json({
                    product_info: this.filterProductData(product_info[0]),
                    product_similar: this.filterProductSimilarData(similar),
                    comments: this.filterProductCommentData(comments),
                    result : 'success',
                    status: 200,
                })
            }
            else {
                res.json({
                    massage: "متاصفانه چنین محصولی پیدا نشد !",
                    result : 'error',
                    status: 404,
                })
            }
        } 
        catch (error) {
            res.json({
                massage: error,
                result : 'error',
                status: 404,
            })
        }


    }

    async storeComment(req, res) {
        let {title, text, token, product} = req.body;
        let isValid = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(isValid) {
            try {
                let info = await Member.findById(isValid.member)

                let newComment = new Comment({
                    member: isValid.member,
                    name: info.name +" "+info.family,
                    product,
                    text,
                    title,
                    active : false
                });
                newComment.save();
                res.json({
                    "result": "success",
                    "status": 201
                });

            } catch (error) {
                res.json({
                    error: "فعلا امکان ثبت نظر وجود ندارد",
                    status: 400,
                    result : 'error'
                })
            }
        }
    }

    async search(req, res) {
        let {key} = req.query;
        
        try {
            let result = await Product.find({name: { $regex: '.*' + key + '.*' } }).limit(15);
            if(result.length > 0) {
                res.json({
                    "product" : this.filterSearchProductData(result),
                    "result": "success",
                    "status": 201
                });
            }
            else {
                res.json({
                    "massage": "چیزی برای نمایش پیدا نشد !",
                    "result": "success",
                    "status": 201
                });
            }
        } catch (error) {
            
        }
    }

    filterSearchProductData(product) {
        return { 
            items : product.map(pro => {
                return {
                    name: pro.name,
                    slug: pro.slug,
                    sku: pro.code,
                    image: pro.images[0].image,
                    price: pro.discount > 0 ? pro.price - (pro.price * pro.discount / 100) : pro.price,
                }
            })
        }

    }

    filterProductCommentData(comment) {
        return { 
            items : comment.map(com => {
                return {
                    title : com.title,
                    text : com.text,
                    date: moment(com.createdAt).format('jYYYY/jM/jD'),
                    name: com.name
                }
            })
        }

    }

    filterProductData(pro) {
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

    filterProductSimilarData(item) {
        return { 
            items : item.map(pro => {
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
                    
                }
            })
        }
    }


}
module.exports = new productCotroller();