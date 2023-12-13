const controller = require('./controller');
const Product = require('../models/product');

class productController extends controller {

    async store(req, res) {
        let {
            images,
            packing,
            body,
            country,
            discount,
            seedCount,
            price,
            buyPrice,
            code,
            stock,
            faale,
            title,
            category_main,
            category_child,
            color,
            status,
            weight,
            property,
            faalePrice,
            faaleBuyPrice,
            faaleLowest,
        } = req.body;

        let newProduct = new Product({
             name: title,   
             slug: this.slug(title),
             code,
             stock,
             price,
             buyPrice,
             discount,
             images,
             colors: color,
             seedCount,
             country,
             weight,
             explanation: body,
             property,
             status,
             cans: packing,
             faale: faale,
             faale_price: faalePrice,
             faale_buy_price: faaleBuyPrice,
             faale_lowest:faaleLowest,
             category_main,
             category_child : category_child !== 0 ? category_child : null,
        });
        newProduct.save();
        res.json({
            result : 'success',
            status: 201,
        })
    }

    slug(title) {
         return title.replace(/([^۰-۹آ-یa-z0-9]|-)+/g , "-")
    }

    async productList(req, res) {
        let {sort} = req.query;
        let myQuery;
        let mySort;

        if(sort === "new") { 
            myQuery = {} 
            mySort = {createdAt : -1}
        }
        else if(sort === "available") { 
            myQuery = {status : true}; 
            mySort = {createdAt : -1}
        }
        else if(sort === "unavailable") { 
            myQuery = {status : false}; 
            mySort = {createdAt : -1}
        }
        else if(sort === "highsale") { 
            myQuery = { saleCount: {$gt : 0} }; 
            mySort = {saleCount : -1} 
        }
        else if(sort === "highprice") { 
            myQuery = { price: {$gt : 0} }; 
            mySort = {price : -1}  
        }
        else if(sort === "lowprice") {
            myQuery = { price: {$gt : 0} }; 
            mySort = {price : 1}   
        }
        else { 
            myQuery = { stock: {$gt : 0} }; 
            mySort = { stock : -1}   
        }

        try {
            let page = req.query.page || 1;
            let product_ = await Product.paginate( myQuery , { page , sort : mySort , limit : 15 });
                res.json({
                    product : this.filterProductData(product_),
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

    filterProductData(product) {
        return { 
            ...product,
            docs : product.docs.map(pro => {
                return {
                    id : pro.id,
                    name : pro.name,
                    slug : pro.slug,
                    code: pro.code,
                    countSale: pro.saleCount,
                    price: pro.price,
                    discount: pro.discount,
                    discountedPrice: pro.discount > 0 ? (pro.price - (pro.price * pro.discount / 100)) : 0,
                    discountPrice: pro.discount > 0 ? (pro.price * pro.discount) / 100 : 0,
                    stock: pro.stock,
                    status: pro.status
                }
            })
        }
    }

    async productImages(req, res) {
        let {pid} = req.query;
        try {
            const img = await Product.findById(pid).exec();
            res.json({
                media : img.images,
                result : 'success',
                status: 200,
            });
        } catch (error) {
            res.json({
                error: error,
                status: 400,
                result : 'error'
            })  
        }
    }

    async destroyImage(req, res) {
        let {image, productID} = req.params;

        try {
            const product = await Product.findById(productID).exec();
            const filtered = product.images.filter(obj => {
                return obj.image !== image;
            });
            await Product.findByIdAndUpdate(productID , { $set : { images : filtered }})
            res.json({
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

    async destroy(req , res  , next) {
        try {
            let {id} = req.params; 
            let product = await Product.findById(id).exec();
            if(!product) {
                res.json({
                    massage: "محصولی با شناسه ارسال شده یافت نشد.",
                    result : 'error',
                    status: 404,
                })
            }

            product.deleteOne();
            res.json({
                result : 'success',
                status: 200,
            })
        } 
        catch (error) {
            next(error);
        }
    }

    async updateImages(req, res) {
        let {images, productID} = req.body;

        try {
            await Product.findByIdAndUpdate(productID , { $set : { images : images }})
            res.json({
                result : 'success',
                status: 200,
            });
        } catch (error) {
            res.json({
                error: error,
                status: 400,
                result : 'error'
            })  
        }
    }

    async updatePrice(req, res) {
       const {price, stock, discount, productID} = req.body;

       try {
            let product = await Product.findByIdAndUpdate(productID, {$set : {price, stock, discount}}); 
            if(!product) {
                res.json({
                    massage: "متاسفانه چنین محصولی موجود نیست",
                    status: 400,
                    result : 'error'
                })  
            }
            res.json({
                result : 'success',
                status: 200,
            });
       } catch (error) {
        res.json({
            error: error,
            status: 400,
            result : 'error'
        })  
       }
    }

    async updateStatus(req, res) {
        let {id, val} = req.params;

        try {
            await Product.findByIdAndUpdate(id, {$set : {status : val}});
            res.json({
                result : 'success',
                status: 200,
            });
        } catch (error) {
            res.json({
                error: error,
                status: 400,
                result : 'error'
            })   
        }
    }

    async productInfo(req, res) {
        let {pid} = req.query;

        try {
            const product = await Product.findById(pid);
            res.json({
                product : product,
                result : 'success',
                status: 200,
            })
        } catch (error) {
            res.json({
                error: error,
                status: 400,
                result : 'error'
            }) 
        }
    }

    // filterProductEditData(product) {
    //     return { 
    //         info : product.map(pro => {
    //             return {
    //                 id : pro.id,
    //                 name : pro.name,
    //                 code: pro.code,
    //                 stock: pro.stock,
    //                 price: pro.price,
    //                 discount: pro.discount,
    //                 colors: pro.colors,
    //                 // packing: pro.packing,
    //                 country: pro.country,
    //                 explanation: pro.explanation,
    //                 property: pro.property,
    //                 status: pro.status,
    //                 // category_main: pro.category_main,
    //                 // category_child: pro.category_child,
    //             }
    //         })
    //     }
    // }

    async update(req, res) {
        let {
            packing,
            body,
            country,
            discount,
            price,
            code,
            stock,
            title,
            category_main,
            category_child,
            color,
            status,
            property,
            id
        } = req.body;

        try {
            await Product.findByIdAndUpdate(id, {
                name: title,   
                slug: this.slug(title),
                stock,
                price,
                discount,
                colors: color,
                packing,
                country,
                explanation: body,
                property,
                status,
                category_main,
                category_child,
            });
            res.json({
                result : 'success',
                status: 200,
            })

        } catch (error) {
            res.json({
                error: error,
                status: 400,
                result : 'error'
            }) 
        }
    }

}

module.exports = new productController();


