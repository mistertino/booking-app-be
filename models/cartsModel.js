const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  title: { type: String, required: true },
})

const CartsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    items: [cartItemSchema],
    status: { type: String, default: 'active' },
  },
  { timestamps: true },
)

const cartsModel = mongoose.model('carts', CartsSchema)
module.exports = cartsModel
