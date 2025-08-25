
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const protect = require('../middleware/security');


router.post('/add' , protect , cartController.addToCart);
router.get('/' , protect , cartController.getCart);
router.delete('/remove' , protect , cartController.removeItemFromCart);
router.delete('/clear' , protect , cartController.clearCart);

module.exports = router;