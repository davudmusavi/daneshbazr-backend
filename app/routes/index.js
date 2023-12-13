const express = require('express');
const router = express.Router();
const auth = require('../passport/passport-jwt')


// controllers 
const adminController = require('../http/controllers/adminController');
const uploaderCotroller = require('../http/controllers/uploadController');
const categoryCotroller = require('../http/controllers/categoryController');
const colorCotroller = require('../http/controllers/colorController');
const productCotroller = require('../http/controllers/productController');
const settingCotroller = require('../http/controllers/settingController');
const orderCotroller = require('../http/controllers/orderController');

router.get('/admin/dashboard', adminController.getDashboardInfo);
router.get('/admin/token', adminController.checkToken);
router.get('/admin/login', adminController.login);
router.post('/admin/create', auth, adminController.store);
router.get('/admin/list', auth, adminController.adminList);
router.get('/admin/member/list', auth, adminController.memberList);
router.get('/admin/member/info', auth, adminController.memberAllInfo);
router.put('/admin/active/:id/:val', auth, adminController.updateActive);
router.delete('/admin/remove/:id', auth, adminController.destroy);
router.delete('/admin/member/:id', auth, adminController.destroyUser);
router.put('/admin/password/:id/:password', auth, adminController.updatePassword);

router.get('/admin/contact/list', auth, adminController.contactList);
router.get('/admin/contact/visit', auth, adminController.updateContact);
router.delete('/admin/contact/remove', auth, adminController.removeContact);

router.post('/admin/media/upload', auth, uploaderCotroller.uploadImage);
router.get('/admin/media/list', auth, uploaderCotroller.mediaList);
router.get('/admin/media/:tag', auth, uploaderCotroller.mediaListByTags);
router.delete('/admin/media/:id', auth, uploaderCotroller.destroy);

router.post('/admin/category/create', auth, categoryCotroller.store);
router.get('/admin/category/list/:id', auth, categoryCotroller.list);
router.delete('/admin/category/:id', auth, categoryCotroller.destroy);

router.post('/admin/color/create', auth, colorCotroller.store);
router.get('/admin/color/list', auth, colorCotroller.colorList);
router.delete('/admin/color/:id', auth, colorCotroller.destroy);


router.get('/admin/order', auth, orderCotroller.getOrder);
router.get('/admin/orderinfo', auth, orderCotroller.getOrderAllInfo);
router.put('/admin/orderlevel', auth, orderCotroller.updateOrderLevel);
router.post('/admin/order/postcode', auth, orderCotroller.updateOrderPostCode);

router.post('/admin/product/create', auth, productCotroller.store);
router.post('/admin/product/images', auth, productCotroller.updateImages);
router.get('/admin/product/list', auth, productCotroller.productList);
router.get('/admin/product/images', auth, productCotroller.productImages);
router.get('/admin/product/editinfo', auth, productCotroller.productInfo);
router.delete('/admin/product/image/:image/:productID', auth, productCotroller.destroyImage);
router.delete('/admin/product/:id', auth, productCotroller.destroy);
router.put('/admin/product/price', auth, productCotroller.updatePrice);
router.put('/admin/product/update', auth, productCotroller.update);
router.put('/admin/product/status/:id/:val', auth, productCotroller.updateStatus);

router.get('/admin/setting', settingCotroller.getSetting);
router.put('/admin/setting/update', settingCotroller.update);

/*------------------------------------- WEB ---------------------------------------------*/

// controllers 
const homeController = require('../http/controllers/web/homeController');
const categoryController = require('../http/controllers/web/categoryController');
const productController = require('../http/controllers/web/productController');
const memberController = require('../http/controllers/web/memberController');
const shopController = require('../http/controllers/web/shopController');

router.get('/web/category', categoryController.getMenuList);
router.get('/web/category/slug', categoryController.getCategory);

router.get('/web/home', homeController.getHomeData);
router.get('/web/product', productController.getProductData);
router.get('/web/product/search', productController.search);
router.post('/web/product/comment/create', auth, productController.storeComment);

router.get('/web/member/create', memberController.store);
router.get('/web/member/login', memberController.login);
router.get('/web/member/verify', memberController.verify);
router.get('/web/member/account/profile', memberController.getAccountDetail);
router.put('/web/member/account/profile', memberController.updateMemberData);
router.get('/web/member/account/order', memberController.orderInfo);
router.post('/web/member/checkToken', memberController.checkToken);
router.post('/web/member/contactUs', memberController.storeContactUs);

router.get('/web/shipping/freeSend', shopController.getFreeSendPrice);
router.post('/web/shipping/info', shopController.getShopInfo);
router.get('/web/shipping/shahr', shopController.getAllShahr);
router.post('/web/shipping/update', shopController.updateMemberInfo);
router.post('/web/shipping/create', auth, shopController.store);
router.post('/web/shipping/verification',auth, shopController.paymentVerification);
router.get('/web/order/tracking', shopController.trackingOrder);

router.post('/web/shipping/payment', shopController.getBankToken);

module.exports = router;