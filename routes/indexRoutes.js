

const express = require('express');
const router = express.Router();

const userRoute = require('./userRoutes');
const productRoute = require('./productRoutes');
const cartRoute = require('./cartRoutes');
const orderRoute = require('./orderRoutes');
const categoryRoute = require('./categoryRoutes');
const wishListRoute = require('./wishListRoutes');


router.get('/' , function(req , res , next){
    return res.json('App is redy now');
});

router.use('/auth' , userRoute);
router.use('/products' , productRoute);
router.use('/carts' , cartRoute);
router.use('/orders' , orderRoute);
router.use('/categories' , categoryRoute);
router.use('/wishlist' , wishListRoute);

module.exports = router;