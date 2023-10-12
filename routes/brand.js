const router = require('express').Router()
const ctrls = require('../controllers/brand')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')



router.post('/', [verifyAccessToken, isAdmin], ctrls.createBrand)
router.get('/', ctrls.getBrand)

module.exports = router