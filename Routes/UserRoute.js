const express = require('express')
const { getCartByUser } = require( '../Controller/CartsController.js')
const { getUserNotAdmin, deleteUser, addPermission } = require( '../Controller/UserController.js')
const router = express.Router()

router.get('/get-cart/:userId', getCartByUser)
router.post('/search', getUserNotAdmin)
router.post('/delete', deleteUser)
router.post('/add-permission', addPermission)

module.exports = router
