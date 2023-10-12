const Product = require('../models/product')
const asynHandler = require('express-async-handler')
const data = require('../../data/data2.json')
const categoryData = require('../../data/cate_brand')
const productCategory = require('../models/productCategory')
const slugify = require('slugify')

const fn = async (product) =>{
    await Product.create({
        title: product?.name,
        slug: slugify(product?.name) + Math.round(Math.random() * 100) + '' ,
        description: product.description,
        brand: product?.brand,
        price: Math.round(Number(product?.price?.match(/\d/g).join('')) / 100),
        category: product?.category[1],
        quantity: Math.round(Math.random() * 1000),
        sold: Math.round(Math.random() * 100),
        images: product?.images,
        color: product?.varriant?.find(el => el.label === 'Color')?.varriant[0]
    })
}

const insertProduct = asynHandler(async(req ,res)=>{
   const promises = []
   for (let product of data) promises.push(fn(product))
   await Promise.all(promises)
    return res.json('Done')
})

const fn2 = async (cate) =>{
    await productCategory.create({
        title: cate?.cate,
        brand: cate?.brand
    })
}

const insertCategory = asynHandler(async(req ,res)=>{
    const promises = []
    console.log(categoryData);
    for (let cate of categoryData) promises.push(fn2(cate))
    await Promise.all(promises)
     return res.json('Done')
 })

module.exports = {
    insertProduct,
    insertCategory
}