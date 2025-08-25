
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const protect = require('../middleware/security');
const adminOnly = require('../middleware/adminMiddleware');

router.post('/' , protect , adminOnly , productController.createProduct);
router.get('/all' , protect , adminOnly , productController.getAllProducts);
router.get('/search' , protect , productController.searchProduct);
router.get('/:id' , protect , adminOnly , productController.getProductsById);
router.put('/:id' , protect , adminOnly , productController.updateProduct);
router.delete('/:id' , protect , adminOnly , productController.deleteProduct);

router.get('/category/:categoryName' , protect , productController.getProductsByCategory);



module.exports = router;