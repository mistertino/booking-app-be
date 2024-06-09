const cartsModel = require('../models/cartsModel.js')
const productModel = require('../models/productModel.js')
const OrderModel = require('../models/orderModel.js')
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const createOrder = async (req, res) => {
  // Xử lý tạo đơn hàng trong db
  const { userId, listCart, info } = req.body

  try {
    // Lấy giỏ hàng của người dùng
    const cart = await cartsModel.findOne({ userId: userId, status: 'active' })
    if (!cart) {
      return res
        .status(404)
        .json({ status: 0, message: 'Không tìm thấy giỏ hàng' })
    }

    let listCartId = listCart.map((item) => item.id)

    // Lấy ra các mục giỏ hàng tương ứng với các sản phẩm được chọn
    const selectedItems = cart.items.filter((item) =>
      listCartId.includes(item._id.toString()),
    )

    if (selectedItems.length === 0) {
      return res
        .status(400)
        .json({ status: 0, message: 'Không có sản phẩm nào được chọn' })
    }

    // Tính tổng số tiền cho các sản phẩm được chọn
    const totalAmount = selectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    )

    // Kiểm tra và cập nhật số lượng tồn kho của các sản phẩm
    for (let item of selectedItems) {
      const product = await productModel.findById(item.productId)
      if (!product) {
        return res.status(404).json({
          status: 0,
          message: `Không tìm thấy sản phẩm với id ${item.productId}`,
        })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          status: 0,
          message: `Sản phẩm ${product.title} không đủ số lượng`,
        })
      }

      product.stock -= item.quantity
      await product.save()
    }

    // Tạo đối tượng đơn hàng mới
    const newOrder = new OrderModel({
      userId: userId,
      listCart: selectedItems,
      totalAmount: totalAmount,
      info: info,
      status: 'waiting',
    })

    // Lưu đối tượng đơn hàng vào cơ sở dữ liệu
    await newOrder.save()

    // Loại bỏ các sản phẩm đã đặt hàng khỏi giỏ hàng
    cart.items = cart.items.filter(
      (item) => !listCartId.includes(item._id.toString()),
    )
    await cart.save()

    res.status(200).json({
      status: 1,
      message: 'Đơn hàng đã được tạo thành công',
      order: newOrder,
    })
  } catch (error) {
    console.log(error)
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

const aggregateOrders = async (req, res) => {
  const { type } = req.query // Lấy tham số `type` từ query string

  if (!type || !['day', 'month', 'year'].includes(type)) {
    return res.status(400).send('Invalid type parameter');
  }

  let groupBy;
  switch (type) {
    case 'day':
      groupBy = {
        year: { $year: '$updatedAt' },
        month: { $month: '$updatedAt' },
        day: { $dayOfMonth: '$updatedAt' }
      };
      break;
    case 'month':
      groupBy = {
        year: { $year: '$updatedAt' },
        month: { $month: '$updatedAt' }
      };
      break;
    case 'year':
      groupBy = {
        year: { $year: '$updatedAt' }
      };
      break;
  }

  try {
    const pipeline = [
      {
        $match: {
          status: 'finish'
        }
      },
      {
        $group: {
          _id: groupBy,
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ];
    const result = await OrderModel.aggregate(pipeline)
    res.status(200).json({data: result})
  } catch (error) {
    console.error('Error generating report', error)
    res.status(500).json({ message: 'Error generating report' })
  }
}

const aggregateAndDownload = async (req, res) => {
  const { type } = req.query // Lấy tham số `type` từ query string

  if (!type || !['day', 'month', 'year'].includes(type)) {
    return res.status(400).send('Invalid type parameter');
  }

  let groupBy;
  switch (type) {
    case 'day':
      groupBy = {
        year: { $year: '$updatedAt' },
        month: { $month: '$updatedAt' },
        day: { $dayOfMonth: '$updatedAt' }
      };
      break;
    case 'month':
      groupBy = {
        year: { $year: '$updatedAt' },
        month: { $month: '$updatedAt' }
      };
      break;
    case 'year':
      groupBy = {
        year: { $year: '$updatedAt' }
      };
      break;
  }

  try {
    const pipeline = [
      {
        $match: {
          status: 'finish'
        }
      },
      {
        $group: {
          _id: groupBy,
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ];
    const result = await OrderModel.aggregate(pipeline)

    // Chuyển đổi kết quả thành định dạng phù hợp cho file Excel
    const data = result.map(item => {
      let date;
      if (type === 'day') {
        date = `${item._id.day}/${item._id.month}/${item._id.year}`;
      } else if (type === 'month') {
        date = `${item._id.month}/${item._id.year}`;
      } else if (type === 'year') {
        date = `${item._id.year}`;
      }
      return [date,`${item.totalAmount} VNĐ`, `${item.count} Đơn`];
    });

    const title = [`Thống kê đơn hàng`];
    const headers = ['Thời gian', 'Tổng tiền', 'Tổng đơn hàng'];

    const worksheetData = [title, headers, ...data];

    // Tạo một worksheet từ dữ liệu
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Tạo một workbook mới và thêm worksheet vào
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Tạo file Excel tạm thời
    const filePath = path.join(__dirname, 'KET_QUA_THONG_KE.xlsx');
    XLSX.writeFile(workbook, filePath);

    // Trả về file cho client
    res.download(filePath, 'KET_QUA_THONG_KE.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file', err);
        res.status(500).send('Error downloading file');
      }

      // Xóa file tạm thời sau khi gửi
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting temporary file', err);
        }
      });
    });
  } catch (error) {
    console.error('Error generating report', error)
    res.status(500).json({ message: 'Error generating report' })
  }
}

module.exports = {
  createOrder,
  getListOrder,
  getListOrderById,
  approveOrder,
  aggregateOrders,
  aggregateAndDownload
}
