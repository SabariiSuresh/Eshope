
const Category = require('../models/category.model');


exports.createCategory = async (req, res) => {

    try {

        const { name , description , parent} = req.body;

        const category = new Category({ name , description , parent : parent || null });

        const newCategory = await category.save();

        return res.status(201).json({ message: 'Category created successfully', category: newCategory });

    } catch (err) {

        return res.status(500).json({ message: 'Failed to create category', error: err.message });

    }
};


exports.getCategories = async (req, res) => {

    try {

        const rootCategories = await Category.find({ parent : null });

        const buildCategoryTree = async (category)=> {

            const children = await Category.find({ parent : category._id});
            const categoryObj = category.toObject();

            if( children.length > 0 ) {

                categoryObj.children = await Promise.all( children.map(buildCategoryTree) );

            }

            return categoryObj;

        }

        const nestedCategories = await Promise.all( rootCategories.map(buildCategoryTree) );

        return res.status(200).json({ message: 'Nested categories', categories: nestedCategories });

    } catch (err) {

        return res.status(500).json({ message: 'Failed to fetch Nested categories', error: err.message });

    }
};


exports.getCategoryById = async (req, res) => {

    try {

        const category = await Category.findById(req.params.id).populate('parent' , 'name');

        if (!category) {

            return res.status(404).json({ message: 'Category not found' });

        } else {

            return res.status(200).json({ message: 'Category', category: category });

        }

    } catch (err) {

        return res.status(500).json({ message: 'Failed to fetch category', error: err.message });

    }
};


exports.updateCategory = async (req, res) => {

    try {

        const category = await Category.findByIdAndUpdate(req.params.id , req.body , { new : true });

         if (!category) {

            return res.status(404).json({ message: 'Category not found' });

        } else {

            return res.status(201).json({ message: 'Category updated', category: category });

        }

    } catch (err) {

        return res.status(500).json({ message: 'Failed to update category', error: err.message });

    }
};


exports.deleteCategory = async (req , res)=> {

    try {

        const category = await Category.findByIdAndDelete(req.params.id , req.body);

           if (!category) {

            return res.status(404).json({ message: 'Category not found' });

        } else {

            return res.status(201).json({ message: 'Category deleted', category: category });

        }
        
    } catch (err) {

        return res.status(500).json({ message: 'Failed to delete category', error: err.message });

    }
};


