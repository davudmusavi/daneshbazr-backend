const controller = require('../controller');

// DB
const Product = require('../../models/product');
const Setting = require('../../models/setting');
const Media = require('../../models/upload');

class homeCotroller extends controller {


    async getHomeData(req, res) {

        // slidershow 
        let slidershow = await Media.find({type: "slidershow"}).sort({'_id': -1}).limit(5)

        // purchase_offer 
        let purchase_offer = await Product.aggregate([{$sample: {size: 20}}]); 

        // last_product
        let last_product = await Product.find().sort({ '_id': -1 }).limit(20)

        // omde_product
        let omde_product = await Product.find( { faale: true } )

        // info
        let info = await Setting.find().sort({ '_id': -1 }).limit(1)

        // top_sale
        let top_sale = await Product.find({saleCount : {$gt : 3}})

        res.json({
            purchase_offer: this.filterProductData(purchase_offer),
            last_product: this.filterProductData(last_product),
            omde_product: this.filterProductData(omde_product),
            top_sale: this.filterTopSaleData(top_sale),
            site: this.filterInfoData(info),
            slidershow: this.filterSlidershowData(slidershow),
            result : 'success',
            status: 200,
        })
    }

    filterInfoData(data) {
        return { 
            title: data[0].title,
            phone: data[0].phone
        } 
    }

    filterSlidershowData(item) {
        return { 
            items : item.map(slide => {
                return {
                    id : slide._id,
                    image: slide.name,
                    name: slide.tag
                }
            })
        }
    }

    filterTopSaleData(item) {
        return { 
            items : item.map(pro => {
                return {
                    id : pro._id,
                    slug: pro.slug,
                    name: pro.name,
                    image: pro.images[0].image,
                }
            })
        }
    }

    filterProductData(item) {
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



}
module.exports = new homeCotroller();