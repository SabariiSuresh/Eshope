
const Product = require('../models/product.model');
const Category = require('../models/category.model');

exports.createProduct = async (req, res) => {

    try {

        const { name, description, price, image, stock, category } = req.body;

        const foundCategory = await Category.findOne({ name: category });

        if (!foundCategory) {

            return res.status(400).json({ message: 'Invalid category name' });

        }

        const product = new Product({ name, description, price, image, stock, category: foundCategory._id });

        const newProduct = await product.save();
        await newProduct.populate('category', 'name');

        return res.status(201).json({ message: "Product create successfully", product: newProduct });

    } catch (err) {

        return res.status(500).json({ message: 'Failed to create product', error: err.message })

    }

}


exports.getAllProducts = async (req, res) => {

    try {

        const products = await Product.find().populate('category', 'name');

        return res.status(200).json({ message: 'All products', products: products });

    } catch (err) {

        return res.status(500).json({ message: 'Failed to get all product', error: err.message })

    }

}


exports.getProductsById = async (req, res) => {

    try {

        const product = await Product.findById(req.params.id).populate('category', 'name');

        if (!product) {

            return res.status(404).json({ message: 'Product not found' });

        } else {

            return res.status(200).json({ message: 'Products', products: product });

        }

    } catch (err) {

        return res.status(500).json({ message: 'Failed to get product', error: err.message })

    }

}

const getAllSubCategoryIds = async (categoryId)=> {

    const subCategories = await Category.find({ parent : categoryId});

    let ids = subCategories.map( cat=> cat._id );

    for( const sub of subCategories ){

            const subIds = await getAllSubCategoryIds(sub._id);

            ids = ids.concat(subIds);

    }

    return ids;

}

exports.getProductsByCategory = async (req, res) => {

    try {

        const categoryName = req.params.categoryName;

        const category = await Category.findOne({ name: categoryName });

        if (!category) {

            return res.status(404).json({ message: 'Category not found' });

        }

        const subCategoryId = await getAllSubCategoryIds(category.id);

        const allCategoryIds = [ category._id , ...subCategoryId ];        

        const products = await Product.find({ category: { $in : allCategoryIds }}).populate('category', 'name')

        if (!products || products.length  === 0 ) {

            return res.status(404).json({ message: 'No products found such category' });

        } else {

            return res.status(200).json({ message: 'Products in category', products });

        }

    } catch (err) {

        return res.status(500).json({ message: 'Failed to get products by category', error: err.message })

    }

}


exports.updateProduct = async (req, res) => {

    try {

        const { category } = req.body;

        if (category) {

            const findCategory = await Category.findOne({ name: category });

            if (!findCategory) {

                return res.status(404).json({ message: 'Invalid category name ' })

            }

            req.body.category = findCategory._id;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category', 'name')

        if (!product) return res.status(404).json({ message: 'Product not found' });

        res.status(201).json({ message: 'Product updated', product });

    } catch (err) {

        return res.status(500).json({ message: 'Failed to update product', error: err.message })

    }

}


exports.deleteProduct = async (req, res) => {

    try {

        const product = await Product.findByIdAndDelete(req.params.id);

        return res.status(200).json({ message: 'Product deleted', product });

    } catch (err) {

        return res.status(500).json({ message: 'Failed to delete product', error: err.message })

    }

}


exports.searchProduct = async (req, res) => {

    try {

        const { keyword, category, minPrice, maxPrice, sort , page = 1 , limit = 10 } = req.query;

        let filter = {};

        if (keyword) {

            filter.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { brand: { $regex: keyword, $options: "i" } }
            ];

        }


        if (category) {

            const categoryDoc = await Category.findOne({ name : category });

            if(categoryDoc) {
                
                filter.category = categoryDoc._id;

            } else {

                filter.category = null;

            }

        }

        if (minPrice || maxPrice) {

            filter.price = {}

            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);

        }

        let query = Product.find(filter).populate('category');

        if (sort) {

            const sortOption = sort === 'priceAsc' ? { price: 1 } : sort === 'priceDesc' ? { price: -1 } : { createdAt: -1 };
            query = query.sort(sortOption);

        }

        const skip = ( page -1 ) * limit;
        const total = await Product.countDocuments(filter);
        const products = await query.skip(skip).limit( Number(limit));

        return res.status(200).json({ page : Number(page) , totalPage : Math.ceil( total / limit ) , totalProducts : total , message : 'Search result', products  });

    } catch (err) {

        return res.status(500).json({ message: 'failed to fetch products', error: err.message }),
        console.error(err)

    }
}