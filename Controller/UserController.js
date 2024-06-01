const cartsModel = require('../models/cartsModel.js')
const productModel = require('../models/productModel.js')

// get giỏ hàng từ người dùng
const getCartByUser = async (req, res) => {
  try {
    if (req && req.params.userId) {
      let cart = await cartsModel
        .findOne({
          userId: req.params.userId,
          status: 'active',
        })
        .populate('items.productId')
      const result = cart.items.map((item) => {
        return {
          id: item?._id,
          productId: item?.productId?._id,
          title: item?.productId?.title || "",
          price: item?.productId?.price || 0 ,
          quantity: item?.quantity || 0,
        }
      })
      res.status(200).json({ data: result })
    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng và giỏ hàng' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getCartByUser,
}
