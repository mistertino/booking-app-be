const mongoose = require( 'mongoose')
const orderSchema = new mongoose.Schema(
  {
    userId: { type: String },
    listCart: [],
    totalAmount: { type: Number },
    info: {},
    status: { type: String, default: 'waiting' },
  },
  { timestamps: true },
)

const OrderModel = mongoose.model('order', orderSchema)
module.exports = OrderModel
