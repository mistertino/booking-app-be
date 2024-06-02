const express = require('express')
const {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require('../Controller/CategoryController.js')
const router = express.Router()

router.post('/create', createCategory)
router.post('/update', updateCategory)
router.post('/delete', deleteCategory)
router.post('/search', getCategory)

module.exports = router
