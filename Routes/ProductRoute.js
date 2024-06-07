const express = require('express')
const {
  createProduct,
  getProduct,
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

module.exports = router
