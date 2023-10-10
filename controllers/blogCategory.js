const BlogCategory = require('../models/blogCategory')
const asynHandler = require('express-async-handler')

const createBlogCategory = asynHandler(async(req ,res)=>{
    const response = await BlogCategory.create(req.body)
    return res.json({
        success: response ? true : false,
        createBlogCategory: response ? response : 'Cannot create new blog-category'
    })
})
const getBlogCategory = asynHandler(async(req ,res)=>{
    const response = await BlogCategory.find().select('title _id')
    return res.json({
        success: response ? true : false,
        BlogCategory: response ? response : 'Cannot get new blog-category'
    })
})
const updateBlogCategory = asynHandler(async(req ,res)=>{
    const {bcid} = req.params;
    const response = await BlogCategory.findByIdAndUpdate(bcid,req.body,{new: true})
    return res.json({
        success: response ? true : false,
        updateBlogCategory: response ? response : 'Cannot update blog-category'
    })
})
const deleteBlogCategory = asynHandler(async(req ,res)=>{
    const {bcid} = req.params;
    const response = await BlogCategory.findByIdAndDelete(bcid)
    return res.json({
        success: response ? true : false,
        deleteBlogCategory: response ? response : 'Cannot blog-category'
    })
})

module.exports = {
    createBlogCategory,
    getBlogCategory,
    updateBlogCategory,
    deleteBlogCategory
}