const express = require('express')
const {
  createProduct,
  getProduct,
  orderProduct,
  getListOrder,
  approveOrder,
  getListOrderById,
  updateProduct,
  deleteProduct,
} = require('../Controller/productController.js')
const {
  addProductToCart,
  deleteProductOnCart,
} = require('../Controller/CartsController.js')
const router = express.Router()

router.post('/create-product', createProduct)
router.post('/update-product', updateProduct)
router.post('/delete-product', deleteProduct)
router.post('/search', getProduct)
router.post('/add-to-cart', addProductToCart)
router.post('/delete-on-cart', deleteProductOnCart)

router.post('/order', orderProduct)
router.post('/get-list-order', getListOrder)
router.post('/get-list-order/:userId', getListOrderById)
router.post('/approve-order', approveOrder)

module.exports = router
