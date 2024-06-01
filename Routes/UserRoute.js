const express = require('express')
const { getCartByUser } = require( '../Controller/UserController.js')
const router = express.Router()

router.get('/get-cart/:userId', getCartByUser)

module.exports = router
