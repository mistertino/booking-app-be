const userModel = require('../models/userModel.js')

const getUserNotAdmin = async (req, res) => {
  const { keySearch } = req.body
  let page = req.query.page
  let size = req.query.size
  try {
    if (page) {
      page = parseInt(page)
      size = parseInt(size)
      if (keySearch) {
        const listUser = await userModel
          .find({
            admin: false,
            $or: [
              { username: { $regex: keySearch, $options: 'i' } },
              { firstname: { $regex: keySearch, $options: 'i' } },
              { lastname: { $regex: keySearch, $options: 'i' } },
            ],
          })
          .sort({ createdAt: -1 })
          .skip((page - 1) * size)
          .limit(size)
        const totalElement = await userModel.countDocuments({
          admin: false,
          $or: [
            { username: { $regex: keySearch, $options: 'i' } },
            { firstname: { $regex: keySearch, $options: 'i' } },
            { lastname: { $regex: keySearch, $options: 'i' } },
          ],
        })
        return res.status(200).json({ data: listUser, totalElement })
      }
      const listUser = await userModel
        .find({ admin: false })
        .sort({ createdAt: -1 })
        .skip((page - 1) * size)
        .limit(size)
      const totalElement = await userModel.countDocuments({ admin: false })
      res.status(200).json({ data: listUser, totalElement })
    } else {
      if (keySearch) {
        const listUser = await userModel.find({
          admin: false,
          $or: [
            { username: { $regex: keySearch, $options: 'i' } },
            { firstname: { $regex: keySearch, $options: 'i' } },
            { lastname: { $regex: keySearch, $options: 'i' } },
          ],
        })
        return res.status(200).json({ data: listUser })
      }
      const listUser = await userModel.find({ admin: false })
      res.status(200).json({ data: listUser })
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

const deleteUser = async (req, res) => {
  const { userId } = req.body
  try {
    await userModel.findByIdAndDelete(userId)
    res.status(200).json({ status: 1 })
  } catch (error) {
    res.status(500).json(error)
  }
}

const addPermission = async (req, res) => {
  const { userId, listPermission, isAdmin } = req.body
  try {
    const isStaff = listPermission?.length > 0 ? true : false
    await userModel.findByIdAndUpdate(userId, { listPermission, admin: isAdmin, staff: isStaff  }, { new: true })
    return res.status(200).json({ status: 1 })
  } catch (error) {
    res.status(500).json(error)
  }
}

module.exports = {
  getUserNotAdmin,
  deleteUser,
  addPermission,
}
