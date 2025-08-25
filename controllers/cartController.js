
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

exports.addToCart = async (req, res) => {

    const { productId, quantity } = req.body;
    const userId = req.user.id;

    try {

        let cart = await Cart.findOne({ user: userId });

        if (!cart) { cart = new Cart({ user: userId, items: [] }); }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {

            cart.items[itemIndex].quantity += quantity;

        } else {

            cart.items.push({ product: productId, quantity });

        }

        const addCart = await cart.save();

        return res.status(200).json({ message: 'Product added to cart', cart: addCart });

    } catch (err) {

        return res.status(500).json({ message: 'Failed to add cart', error: err.message });

    }

}


exports.getCart = async (req, res) => {

    const userId = req.user.id;

    try {

        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart) {

            return res.status(401).json({ items: [], message: "Cart is empty" });

        } else {

            return res.status(200).json({ message: "Your cart", cart: cart });

        }

    } catch (err) {

        return res.status(500).json({ message: 'Failed to fetch cart', error: err.message });

    }
}



exports.removeItemFromCart = async (req, res) => {

    const { productId } = req.body;
    const userId = req.user.id;

    try {

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {

            return res.status(404).json({ message: 'cart not found' });

        } else {

            cart.items = cart.items.filter(item => item.product.toString() !== productId);

            const removeCart = await cart.save();

            return res.status(200).json({ message: 'item removed from cart', cart: removeCart });
        }

    } catch (err) {

        return res.status(500).json({ message: 'Failed to remove item from cart', error: err.message });

    }

}


exports.clearCart = async (req, res) => {

    try {

        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {

            return res.status(404).json({ message: "Cart not fount to clear" });

        } else {

            cart.items = [];
            const clearCart = await cart.save();
            return res.status(200).json({ message: 'Cart cleared', cart: clearCart });

        }

    } catch (err) {

        return res.status(500).json({ message: 'Failed to clear cart', error: err.message });

    }

}