const express = require( 'express')
const { create, callbackPayment } = require( '../Controller/PaymentController.js')
const router = express.Router()

router.post('/create', create)
router.post('/callback', callbackPayment)

module.exports = router

