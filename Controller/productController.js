const mongoose = require('mongoose')
const cloudinary = require('../cloudinary/cloudinary.js')
const productModel = require('../models/productModel.js')
const userModel = require('../models/userModel.js')
const { v4: uuid } = require('uuid')
const OrderModel = require('../models/orderModel.js')

// Create Product
const createProduct = async (req, res) => {
  const { title, image, description, priceBySize, stock, category, categoryName } = req.body
  try {
    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        upload_preset: 'upload_image_unsigned',
        allowed_formats: ['png', 'jpg', 'jpeg', 'svg', 'ico', 'jfif'],
      })
      const newProduct = new productModel({
        title,
        description,
        priceBySize,
        stock,
        image: { public_id: result.public_id, url: result.secure_url },
        category,
        categoryName
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
  const { productId, title, description, priceBySize, stock, category, categoryName } = req.body
  try {
    // const newProduct = new productModel(req.body)
    const product = await productModel.findByIdAndUpdate(
      productId,
      { title, description, priceBySize, stock, category, categoryName },
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

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
}
