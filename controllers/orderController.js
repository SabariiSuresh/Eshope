
const Order = require('../models/order.model');
const Product = require('../models/product.model');


const calcTotals = (items) => {

    const itemPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const taxPrice = Number((itemPrice * 0.18).toFixed(2));
    const shippingPrice = itemPrice > 1000 ? 0 : 49;
    const totalPrice = Number((itemPrice + taxPrice + shippingPrice).toFixed(2));

    return { itemPrice, taxPrice, shippingPrice, totalPrice };

};


exports.placeOrder = async (req, res) => {
    try {

        const { cartItems, shippingAddress, paymentMethod } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const orderItems = [];

        for (const ci of cartItems) {

            const prod = await Product.findById(ci.productId);

            if (!prod) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (prod.stock < ci.qty) {
                return res.status(400).json({ message: `Insufficient stock for ${prod.name}` })
            }

            orderItems.push({

                product: prod._id,
                name: prod.name,
                qty: ci.qty,
                price: prod.price

            });
        }

        const totals = calcTotals(orderItems);

        const order = await Order.create({
            user: req.user.id,
            orderItems,
            shippingAddress,
            paymentMethod: paymentMethod || 'COD',
            ...totals
        });

        for (const item of orderItems) {

            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });

        }

        return res.status(201).json({ message: 'Order placed', order: order });

    } catch (err) {

        return res.status(500).json({ message: 'Failed to place order', error: err.message }),
            console.error("failed to place order", err);

    }
}


exports.getMyOrder = async (req, res) => {

    try {

        const orders = await Order.find({ user: req.user.id }).sort('-createdAt');

        return res.status(200).json({ message: 'My orders', order: orders });

    } catch (err) {

        return res.status(500).json({ message: 'Failed to fetch orders', error: err.message });

    }
}


exports.getOrderById = async (req, res) => {

    try {

        const order = await Order.findById(req.params.id).populate('user', 'name email').populate('orderItems.product', 'image category');

        if (!order) return res.status(404).json({ message: 'Order not found', order: order });

        console.log("req.user:", req.user);
        console.log("order.user:", order.user);


        if (req.user.role !== 'admin' && order.user._id?.toString() !== req.user.id?.toString()) {

            return res.status(403).json({ message: 'Not allowed' });

        } else {

            return res.status(200).json({ message: 'Your order', order: order });

        }

    } catch (err) {

        return res.status(500).json({ message: 'Failed to fetch your order', error: err.message }),
            console.error(err);

    }
}


exports.payOrder = async (req, res) => {

    try {

        const { id } = req.params;
        const { paymentId, status, update_time, email_address } = req.body;

        const order = await Order.findById(id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.user.role !== 'admin' && order.user._id?.toString() !== req.user.id?.toString()) {

            return res.status(403).json({ message: 'Not allowed' });

        } else {

            order.status = 'paid',
                order.isPaid = true,
                order.paidAt = new Date,
                order.paymentResult = { id: paymentId, status, update_time, email_address };

            const paymentOrder = await order.save();

            return res.status(201).json({ message: 'Payment successfull', order: paymentOrder });

        }

    } catch (err) {

        return res.status(500).json({ message: 'Failed to make payment', error: err.message });

    }
}


exports.updateStatus = async (req, res) => {

    try {

        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        const valid = ['shipped', 'delivered', 'cancelled'];

        if (!valid.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' })
        }

        order.status = status;

        if (status === 'delivered') {

            order.isDelivered = true;
            order.deliveredAt = new Date();

        }

        if (status === 'cancelled') {
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
            }
        }

        const orderUpdated = await order.save();

        return res.status(201).json({ message: 'Status updated', order: orderUpdated })

    } catch (err) {

        return res.status(500).json({ message: 'Failed to update status', error: err.message });

    }
}


exports.cancellOrder = async (req, res) => {

    try {

        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.user.toString() !== req.user.id.toString()) {

            return res.status(403).json({ message: 'Not allowed' });

        }

        if (['shipped', 'delivered'].includes(order.status)) {

            return res.status(400).json({ message: 'Canot cancel shipped/delivered order', order: order });

        }

        order.status = 'cancelled';

        for (const item of order.orderItems) {

            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });

        }

        const orderCancel = await order.save();

        return res.status(200).json({ message: 'Order calcelled', order: orderCancel });

    } catch (err) {

        return res.status(500).json({ message: 'Failed to cancel order', error: err.message });

    }
}


exports.updaterOrderToDelivered = async (req, res) => {

    try {

        const order = await Order.findById(req.params.id);

        if (!order) {

            return res.status(404).json({ message: 'Order not found' });

        } else {

            order.status = 'delivered';
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            const updateOrder = await order.save();

            return res.status(200).json({ message: 'Order updated to delivered', order: updateOrder });

        }

    } catch (err) {

        return res.status(500).json({ message: 'Failed to update', error: err.message });

    }

}


exports.getAllOrders = async (req, res) => {

    try {

        const orders = await Order.find().populate('user', 'name email').sort('-createdAt');

        return res.status(200).json({ message: 'All orders', order: orders });

    } catch (err) {

        return res.status(500).json({ message: 'Failed to fetch order', error: err.message });

    }

}