const Brand = require('../models/brand')
const asynHandler = require('express-async-handler')

const createBrand = asynHandler(async(req ,res)=>{
    const response = await Brand.create(req.body)
    return res.json({
        success: response ? true : false,
        brand: response ? response : 'Cannot create new brand'
    })
})
const getBrand = asynHandler(async(req ,res)=>{
    const response = await Brand.find()
    return res.json({
        success: response ? true : false,
        brands: response ? response : 'Cannot get new brand'
    })
})

module.exports = {
    createBrand,
    getBrand
}