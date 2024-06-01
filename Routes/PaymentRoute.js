const express = require( 'express')
const { create } = require( '../Controller/PaymentController.js')
const router = express.Router()

router.get('/create', create)

module.exports = router

