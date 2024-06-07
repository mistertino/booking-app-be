const express = require('express')
const { createOrder, getListOrder, getListOrderById, approveOrder, aggregateOrders } = require('../Controller/OrderController.js')
const router = express.Router()

router.post('/create', createOrder)
router.post('/get-list-order', getListOrder)
router.post('/get-list-order/:userId', getListOrderById)
router.post('/approve-order', approveOrder)
router.get('/aggregate-order', aggregateOrders)

module.exports = router
