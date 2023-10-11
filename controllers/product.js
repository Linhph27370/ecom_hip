const { response } = require('express')
const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')

const createProduct = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const newProduct = await Product.create(req.body)
    return res.status(200).json({
        success: newProduct ? true : false,
        createdProduct: newProduct ? newProduct : 'Cannot create new product'
    })
})
const getProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    const product = await Product.findById(pid)
    return res.status(200).json({
        success: product ? true : false,
        productData: product ? product : 'Cannot get product'
    })
})
// Filtering, sorting & pagination
const getProducts = asyncHandler(async (req, res) => {
    const queries = {...req.query}
    //tách các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach((el)=>{
        delete queries[el]
        });

        //format lại các operators cho đúng cú pháp mongoose
        let queryString = JSON.stringify(queries)
        queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g,macthedEl => `$${macthedEl}`)
        const formatedQueries = JSON.parse(queryString)
        console.log('key',formatedQueries);
        //Filterring
        if(queries?.title) formatedQueries.title = {$regex: queries.title, $options: 'i'}
        let queryCommand = Product.find(formatedQueries)

        //Sorting 
        if(req.query.sort){
            const sortBy = req.query.sort.split(",").join(" ")
            queryCommand = queryCommand.sort(sortBy)
        }
        // fields
        if(req.query.fields){
            const fields = req.query.fields.split(",").join(" ")
            queryCommand = queryCommand.select(`${fields}`)
        }

        //Pagination
        //limit
        // skip : 
        // +dasdasd => NaN
        const page = +req.query.page || 1 
        const limit = +req.query.limit || 5
        console.log(`page ${page}, limit ${limit}`);
        // product_total = 6 
        // skip = (4-1) * 3
        //0 thì sẽ không skip san phẩm nào 
        //3 thi sẽ skip 3 sản phẩm ( bỏ qua 3 sản phẩm )
        const skip = (page - 1) * limit
        console.log(`skip ${skip}`);
        queryCommand.skip(skip).limit(limit)
        //Execute query
        //Số lượng sp thỏa mãn điều kiện !== số lượng sp trả về 1 lần gọi api
        queryCommand.exec(async(err, response) =>{
            if(err) throw new Error(err.message)
            const counts = await Product.find(formatedQueries).countDocuments()
            return res.status(200).json({
                success: response ? true : false,
                productDatas: response ? response : "Cannot get products",
                counts
            })
        })
})

const ratings = asyncHandler(async (req, res ) =>{
    const  {_id} = req.user;
    const { star , comment ,pid} =  req.body
    if( !star || !pid) throw new Error('Missing inputs')
    const ratingProduct = await Product.findById(pid)
    const alreadyRating = ratingProduct?.ratings?.find(el => el.postedBy.toString() === _id)
    console.log({alreadyRating});
    if(alreadyRating){
        //update star & comment
         await Product.updateOne({
            // cú elemMatch cú pháp của moogoose
            ratings : { $elemMatch: alreadyRating}
        },{
            // $set:{'ratings.$':{...alreadyRating,_id:_id,comment}}
            $set : {"ratings.$.star": star, "ratings.$.comment": comment}
        },
        {
            new: true
        }
        )
    }else{
        //add srar & comment
      await Product.findByIdAndUpdate(pid,{
            $push : {ratings: {star , comment ,postedBy:_id }}  
        },
        {new:true})
        // {new :true}).populate("ratings.postedBy","name")
        // {new :true}).populate('ratings.postedBy','name').lean()
    }
     //sum rating 
    const updatedProduct = await Product.findById(pid)
    // tinh duoc tong so danh gia
    const ratingCount = updatedProduct.ratings.length

    const sumRatings = updatedProduct.ratings.reduce((sum,el) => sum + +el.star, 0)
    //chia
    updatedProduct.totalRatings = Math.round(sumRatings * 10/ratingCount) / 10 
    await updatedProduct.save()
    return res.status(200).json({
        status: true,
        updatedProduct,
    })
})
   



// const ratings = asyncHandler(async (req, res) => {
//     const {_id} = req.user;
//     const {star, comment, pid} = req.body;

//     if (!star || !pid) {
//         return res.status(400).json({
//             status: false,
//             message: "Thiếu thông tin đánh giá."
//         });
//     }

//     try {
//         let ratingProduct = await Product.findById(pid); // Khai báo và khởi tạo ratingProduct

//         const alreadyRatingIndex = ratingProduct?.ratings?.findIndex(el => el.postedBy.toString() === _id);
//         const alreadyRating = alreadyRatingIndex !== -1 ? ratingProduct.ratings[alreadyRatingIndex] : null;

//         if (alreadyRating) {
//             // Cập nhật star & comment
//             await Product.updateOne(
//                 { "_id": pid, "ratings._id": alreadyRating._id },
//                 { "$set": { "ratings.$.star": star, "ratings.$.comment": comment } }
//             );
//         } else {
//             // Thêm star & comment mới
//             await Product.findByIdAndUpdate(
//                 pid,
//                 { $push: { ratings: { star, comment, postedBy: _id } } },
//                 { new: true }
//             );
//         }

//         // Lấy lại ratingProduct sau khi cập nhật
//         ratingProduct = await Product.findById(pid); // Cập nhật ratingProduct

//         return res.status(200).json({
//             status: true,
//             message: "Đánh giá thành công!",
//             // updatedRating: alreadyRating ? { ...alreadyRating, star, comment } : { star, comment },
//             ratingProduct
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: "Lỗi trong quá trình đánh giá.",
//             error: error.message
//         });
//     }
// });






const updateProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, { new: true })
    return res.status(200).json({
        success: updatedProduct ? true : false,
        updatedProduct: updatedProduct ? updatedProduct : 'Cannot update product'
    })
})
const deleteProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    const deletedProduct = await Product.findByIdAndDelete(pid)
    return res.status(200).json({
        success: deletedProduct ? true : false,
        deletedProduct: deletedProduct ? deletedProduct : 'Cannot delete product'
    })
})
/// test
const uploadImageProduct = asyncHandler(async ( req, res) =>{
    const { pid } = req.params
    if(!req.files) throw new Error('Missing inputs')
    const response = await Product.findByIdAndUpdate(pid, {$push: {images: {$each : req.files.map(el => el.path)}}})
    return res.status(200).json({
        status: response ? true : false,
        updateProduct: response ? response : 'Can not update images product'
    })
})

module.exports = {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    ratings,
    uploadImageProduct
}