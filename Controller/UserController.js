const userModel = require( '../models/userModel.js')
const bcrypt = require( 'bcrypt')
const jwt = require( 'jsonwebtoken')

// get giỏ hàng từ người dùng
const getCartByUser = async (req, res) => {
  try {
    if (req && req.params.userId) {
      const user = await userModel.findById(req.params.userId)
      res.status(200).json({ data: user.cart.reverse() })
    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getCartByUser
};

// //get user
// export const getUser = async (req, res) => {
//   const id = req.params.id
//   try {
//     const user = await userModel.findById(id)
//     const { password, ...other } = user._doc
//     if (user) {
//       res.status(200).json(other)
//     } else res.status(404).json('no such user exists')
//   } catch (error) {
//     res.status(500).json({ message: error.message })
//   }
// }

// //get all user
// export const getAllUsers = async (req, res) => {
//   try {
//     let users = await userModel.find()
//     users = users.map((user) => {
//       const { password, ...other } = user._doc
//       return other
//     })
//     res.status(200).json(users)
//   } catch (error) {
//     res.status(500).json({ message: error.message })
//   }
// }
