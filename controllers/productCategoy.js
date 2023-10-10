const Productcategory = require('../models/productCategory')
const asynHandler = require('express-async-handler')

const createCategory = asynHandler(async(req ,res)=>{
    const response = await Productcategory.create(req.body)
    return res.json({
        success: response ? true : false,
        createCategory: response ? response : 'Cannot create new product-category'
    })
})
const getCategory = asynHandler(async(req ,res)=>{
    const response = await Productcategory.find().select('title _id')
    return res.json({
        success: response ? true : false,
        productCategories: response ? response : 'Cannot get new product-category'
    })
})
const updateCategory = asynHandler(async(req ,res)=>{
    const {pcid} = req.params;
    const response = await Productcategory.findByIdAndUpdate(pcid,req.body,{new: true})
    return res.json({
        success: response ? true : false,
        updateCategory: response ? response : 'Cannot update product-category'
    })
})
const deleteCategory = asynHandler(async(req ,res)=>{
    const {pcid} = req.params;
    const response = await Productcategory.findByIdAndDelete(pcid)
    return res.json({
        success: response ? true : false,
        createCategory: response ? response : 'Cannot deleteproduct-category'
    })
})

module.exports = {
    createCategory,
    getCategory,
    updateCategory,
    deleteCategory
}