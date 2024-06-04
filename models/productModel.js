const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      public_id: { type: String },
      url: { type: String },
    },
    description: {
      type: String,
    },
    price: { type: Number },
    stock: { type: Number },
    category: { type: String },
    categoryName: { type: String },
    priceBySize: {
      sizeS: { type: Number },
      sizeM: { type: Number },
      sizeL: { type: Number },
    },
  },
  { timestamps: true },
)

const productModel = mongoose.model('products', ProductSchema)
module.exports = productModel
