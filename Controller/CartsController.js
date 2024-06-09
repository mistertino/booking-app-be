const mongoose = require('mongoose')
const productModel = require('../models/productModel.js')
const cartsModel = require('../models/cartsModel.js')

// Thêm vào giỏ hàng
const addProductToCart = async (req, res) => {
  const { productId, userId, quantity, size } = req.body
  try {
    const product = await productModel.findById(productId)
    if (!product) {
      return res.status(400).json('Không tồn tại sản phẩm')
    }
    // Kiểm tra xem giỏ hàng "active" của người dùng có tồn tại không
    let cart = await cartsModel.findOne({ userId: userId, status: 'active' })

    // Nếu không có giỏ hàng "active", tạo giỏ hàng mới
    if (!cart) {
      cart = new cartsModel({
        userId: userId,
        items: [],
        status: 'active',
      })
    }
    //  Kiểm tra sản phẩm còn trong kho không
    if (product.stock > quantity) {
      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId && item.size === size,
      )

      if (itemIndex > -1) {
        // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
        cart.items[itemIndex].quantity += quantity
      } else {
        // Nếu sản phẩm chưa có trong giỏ hàng, thêm sản phẩm mới
        cart.items.push({
          productId: productId,
          title: product.title,
          quantity: quantity,
          price: product.priceBySize[size],
          size: size
        })
      }
      await cart.save()
      res.status(200).json({ status: 1 })
    } else res.status(400).json('Số lượng trong kho không đủ')
  } catch (error) {
    res.status(500).json(error)
  }
}

// Xoá khỏi giỏ hàng
const deleteProductOnCart = async (req, res) => {
  const { cartId, productId, userId } = req.body
  try {
    const cart = await cartsModel.findOneAndUpdate(
      {
        userId: userId,
      },
      {
        $pull: {
          // Sử dụng $pull để xoá các phần tử trong mảng items
          items: {
            _id: cartId,
          },
        },
      },
      { new: true }, // Trả về bản ghi mới sau khi đã cập nhật
    )
    if (!cart) {
      return res
        .status(404)
        .json({ status: 0, message: 'Không tìm thấy giỏ hàng' })
    }
    res.status(200).json({ status: 1 })
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

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
          title: item?.productId?.title || '',
          price: item?.price || 0,
          quantity: item?.quantity || 0,
          size: item?.size || ""
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
  addProductToCart,
  deleteProductOnCart,
  getCartByUser,
}
