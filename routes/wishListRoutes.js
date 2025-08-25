
const express = require('express');
const router = express.Router();
const protect = require('../middleware/security');
const wishListController = require('../controllers/wishListController');
const { model, models } = require('mongoose');

router.post('/add' , protect , wishListController.addWishList);
router.get('/' , protect , wishListController.getWishList);
router.delete('/remove' , protect , wishListController.removeWishlist);

module.exports = router;