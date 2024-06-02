const mongoose = require('mongoose')
const categoryModel = require('../models/categoryModel.js')
// Create Category
const createCategory = async (req, res) => {
  try {
    const category = new categoryModel(req.body)
    await category.save()
    res.status(200).json(category)
  } catch (error) {
    res.status(500).json(error)
  }
}

// Update Category
const updateCategory = async (req, res) => {
  const { categoryId, name, code } = req.body
  try {
    const category = await categoryModel.findByIdAndUpdate(
      categoryId,
      { name, code },
      { new: true },
    )
    res.status(200).json({ status: 1 })
  } catch (error) {
    res.status(500).json(error)
  }
}

// Delete Category
const deleteCategory = async (req, res) => {
  const { categoryId } = req.body
  try {
    await categoryModel.findByIdAndDelete(categoryId)
    res.status(200).json({ status: 1 })
  } catch (error) {
    res.status(500).json(error)
  }
}

// get category
const getCategory = async (req, res) => {
  const { name, code } = req.body
  let page = req.query.page
  let size = req.query.size
  try {
    if (page) {
      page = parseInt(page)
      size = parseInt(size)
      // tìm kiếm theo tên
      if (name) {
        const newCategory = await categoryModel
          .find({
            name: { $regex: name, $options: 'i' },
          })
          .sort({ createdAt: -1 })
          .skip((page - 1) * size)
          .limit(size)
        const totalElement = await categoryModel.countDocuments({
          name: { $regex: name, $options: 'i' },
        })
        return res.status(200).json({ data: newCategory, totalElement })
      }
      // tìm kiếm theo mã
      if (code) {
        const newCategory = await categoryModel
          .find({
            code: code,
          })
          .sort({ createdAt: -1 })
          .skip((page - 1) * size)
          .limit(size)
        const totalElement = await categoryModel.countDocuments({
          code: code,
        })
        return res.status(200).json({ data: newCategory, totalElement })
      }
      const newCategory = await categoryModel
        .find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * size)
        .limit(size)
      const totalElement = await categoryModel.countDocuments()
      res.status(200).json({ data: newCategory, totalElement })
    } else {
      if (name) {
        const newCategory = await categoryModel.find({
          name: { $regex: name, $options: 'i' },
        })
        return res.status(200).json({ data: newCategory })
      }
      if (code) {
        const newCategory = await categoryModel.find({ code })
        return res.status(200).json({ data: newCategory })
      }
      const newCategory = await categoryModel.find({})
      res.status(200).json({ data: newCategory })
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
}
