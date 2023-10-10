const Coupon = require('../models/coupon')
const asynHandler = require('express-async-handler')

const createNewCoupon = asynHandler(async(req ,res)=>{
    const {name , discount , expiry} = req.body
    if(!name || !discount || !expiry) throw new Error('Missing inputs 122')
    const response = await Coupon.create({
        ...req.body,
        expiry: Date.now() + +expiry * 24 * 60 * 60 * 1000
        })
    return res.json({
        success: response ? true : false,
        createCoupon: response ? response : 'Cannot create coupon'
    })
})
const getCoupon = asynHandler(async(req ,res)=>{
    const response = await Coupon.find().select('-createdAt -updatedAt')
    return res.json({
        success: response ? true : false,
        getCoupon: response ? response : 'Cannot get coupon'
    })
})
const updateCoupon = asynHandler(async(req ,res)=>{
    const { cid } = req.params;
    if(Object.keys(req.body).length === 0) throw new Error (' Missing inputs 1')
    if(req.body.expiry) req.body.expiry = Date.now() + +req.body.expiry * 24 * 60 * 60 * 1000
    const response = await Coupon.findByIdAndUpdate(
        cid,
        req.body,
        {new: true}
    )
    return res.json({
        success: response ? true : false,
        updateCoupon: response ? response : 'Cannot update coupon'
    })
})
const deleteCoupon = asynHandler(async(req ,res)=>{
    const { cid } = req.params
    const response = await Coupon.findByIdAndDelete(cid)
    return res.json({
        success: response ? true : false,
        getCoupon: response ? response : 'Cannot get coupon'
    })
})
module.exports = {
    createNewCoupon,
    getCoupon,
    updateCoupon,
    deleteCoupon
}