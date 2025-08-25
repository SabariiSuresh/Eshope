
const wishlistModel = require('../models/wishlist.model');
const WishList = require('../models/wishlist.model');


exports.addWishList = async (req, res) => {

    try {

        const { productId } = req.body;
        const userId = req.user.id;

        let wishList = await WishList.findOne({ user: userId });

        if (!wishList || wishList.length === 0) {

            wishList = new WishList({ user: userId, items: [] });

        }

        if (wishList.items.some(item => item.product.toString() === productId)) {

            return res.status(400).json({ message: 'Product alredy in wishlist ' });

        } else {

            wishList.items.push({ product: productId });

            await wishList.save();

            return res.status(201).json({ message: 'Added to wishlist ', wishList });

        }

    } catch (err) {

        return res.status(500).json({ message: 'Failed to add wishlist', error: err.message });

    }
};



exports.getWishList = async (req, res) => {
    try {

        const wishList = await wishlistModel.findOne({ user: req.user.id }).populate('items.product');

        if (!wishList) {

            return res.status(200).json({ message: 'Wishlist not found' , wishList : { items : [] }});

        }

        return res.status(200).json({ message: 'Your wishlist', wishList });

    } catch (err) {

        return res.status(500).json({ message: 'Failed to fetech wishlist', error: err.message });

    }
}


exports.removeWishlist = async (req , res)=> {

    try {

        const { productId } = req.body;

        const wishList = await WishList.findOne({ user : req.user.id });

         if (!wishList) {

            return res.status(200).json({ message: 'Wishlist not found' , wishList : { items : [] }});

        }

        wishList.items = wishList.items.filter(item=> item.product.toString() !== productId );

        await wishList.save();

        return res.status(200).json({ message: 'Wishlist removed' });

    } catch (err) {

        return res.status(500).json({ message: 'Failed to remove wishlist', error: err.message });

    }
}