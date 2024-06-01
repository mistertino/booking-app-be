const mongoose = require('mongoose')
const cloudinary = require('../cloudinary/cloudinary.js')
const productModel = require('../models/productModel.js')
const cartsModel = require('../models/cartsModel.js')
const userModel = require('../models/userModel.js')
const { v4: uuid } = require('uuid')
const OrderModel = require('../models/orderModel.js')

// Create Product
const createProduct = async (req, res) => {
  const { title, image, description, price, stock, category } = req.body
  try {
    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        upload_preset: 'upload_image_unsigned',
        allowed_formats: ['png', 'jpg', 'jpeg', 'svg', 'ico', 'jfif'],
      })
      const newProduct = new productModel({
        title,
        description,
        price,
        stock,
        image: { public_id: result.public_id, url: result.secure_url },
        category,
      })
      await newProduct.save()
      res.status(200).json(newProduct)
    } else {
      const newProduct = new productModel(req.body)
      await newProduct.save()
      res.status(200).json(newProduct)
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

// Update Product
const updateProduct = async (req, res) => {
  const { productId, title, description, price, stock, category } = req.body
  try {
    // const newProduct = new productModel(req.body)
    const product = await productModel.findByIdAndUpdate(
      productId,
      { title, description, price, stock, category },
      { new: true },
    )
    // await newProduct.save()
    res.status(200).json({ status: 1 })
  } catch (error) {
    res.status(500).json(error)
  }
}

// Delete Product
const deleteProduct = async (req, res) => {
  const { productId } = req.body
  try {
    // const newProduct = new productModel(req.body)
    await productModel.findByIdAndDelete(productId)
    // await newProduct.save()
    res.status(200).json({ status: 1 })
  } catch (error) {
    res.status(500).json(error)
  }
}

// get product
const getProduct = async (req, res) => {
  const { title, category } = req.body
  let page = req.query.page
  let size = req.query.size
  try {
    if (page) {
      page = parseInt(page)
      size = parseInt(size)
      // tìm kiếm theo tên (title)
      if (title) {
        const newProduct = await productModel
          .find({
            title: { $regex: title, $options: 'i' },
          })
          .sort({ createdAt: -1 })
          .skip((page - 1) * size)
          .limit(size)
        const totalElement = await productModel.countDocuments({
          title: { $regex: title, $options: 'i' },
        })
        res.status(200).json({ data: newProduct, totalElement })
      }
      // tìm kiếm theo danh mục
      else if (category) {
        const newProduct = await productModel
          .find({
            category: category,
          })
          .sort({ createdAt: -1 })
          .skip((page - 1) * size)
          .limit(size)
        const totalElement = await productModel.countDocuments({
          category: category,
        })
        res.status(200).json({ data: newProduct, totalElement })
      } else {
        const newProduct = await productModel
          .find({})
          .sort({ createdAt: -1 })
          .skip((page - 1) * size)
          .limit(size)
        const totalElement = await productModel.countDocuments()
        res.status(200).json({ data: newProduct, totalElement })
      }
    } else {
      const newProduct = await productModel.find({})
      res.status(200).json({ data: newProduct })
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

// Thêm vào giỏ hàng
const addProductToCart = async (req, res) => {
  const { productId, userId, quantity } = req.body
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
        (item) => item.productId.toString() === productId,
      )
      if (itemIndex > -1) {
        // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
        cart.items[itemIndex].quantity += quantity
      } else {
        // Nếu sản phẩm chưa có trong giỏ hàng, thêm sản phẩm mới
        cart.items.push({
          productId: productId,
          quantity: quantity,
          price: product.price,
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
  const {cartId, productId, userId } = req.body
  try {
    const cart = await cartsModel.findOneAndUpdate(
      { 
        userId: userId,
      },
      {
        $pull: { // Sử dụng $pull để xoá các phần tử trong mảng items
          items: {
            _id: cartId,
          },
        },
      },
      { new: true }, // Trả về bản ghi mới sau khi đã cập nhật 
    )
    console.log(cart);
    if (!cart) {
      return res
        .status(404)
        .json({ status: 0, message: 'Không tìm thấy giỏ hàng' })
    }
    res.status(200).json({ status: 1 })
  } catch (error) {
    console.log(error);
    res.status(500).json(error)
  }
}

// Order sản phẩm
const orderProduct = async (req, res) => {
  const { listCart, userId } = req.body
  try {
    // const user = await userModel.findById(userId)
    const newOrder = new OrderModel(req.body)
    await newOrder.save()
    const user = await userModel.findById(userId)
    const listCartOld = user.cart
    const tempArray = []

    for (let item1 of listCart) {
      const id1 = item1.id
      let found = false
      for (let item2 of listCartOld) {
        const id2 = item2.id
        if (id1 === id2) {
          found = true
          break
        }
      }
      if (!found) {
        tempArray.push(item1)
      }
    }

    for (let item2 of listCartOld) {
      const id2 = item2.id
      let found = false
      for (let item1 of listCart) {
        const id1 = item1.id
        if (id2 === id1) {
          found = true
          break
        }
      }
      if (!found) {
        tempArray.push(item2)
      }
    }
    await user.updateOne({ cart: tempArray })
    res.status(200).json({ status: 1 })
  } catch (error) {
    res.status(500).json(error)
  }
}

// get list order
const getListOrder = async (req, res) => {
  // const { listCart, userId } = req.body
  let page = req.query.page
  let size = req.query.size
  try {
    if (page) {
      page = parseInt(page)
      size = parseInt(size)
      const listOrder = await OrderModel.find({})
        .sort({ createdAt: -1 }) //ngày tạo
        .skip((page - 1) * size) // bỏ qua số bản ghi
        .limit(size)
      const totalElement = await OrderModel.countDocuments()
      res.status(200).json({ data: listOrder, totalElement })
    } else {
      const listOrder = await productModel.find({})
      res.status(200).json({ data: listOrder })
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

// get list order by userID
const getListOrderById = async (req, res) => {
  const userId = req.params
  let page = req.query.page
  let size = req.query.size
  try {
    if (page) {
      page = parseInt(page)
      size = parseInt(size)
      const listOrder = await OrderModel.find({ userId: userId.userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * size)
        .limit(size)

      const totalElement = await OrderModel.countDocuments({
        userId: userId.userId,
      })
      res.status(200).json({ data: listOrder, totalElement })
    } else {
      const listOrder = await OrderModel.find({ userId: userId.userId })
      res.status(200).json({ data: listOrder })
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

// xác nhận đơn hàng
const approveOrder = async (req, res) => {
  const { type, orderId } = req.body
  try {
    const order = await OrderModel.findById(orderId)
    await order.updateOne({
      status: type,
    })
    res.status(200).json({ status: 1 })
  } catch (error) {
    res.status(500).json(error)
  }
}

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  addProductToCart,
  deleteProductOnCart,
  orderProduct,
  getListOrder,
  getListOrderById,
  approveOrder,
}
