const axios = require('axios').default // npm install axios
const CryptoJS = require('crypto-js') // npm install crypto-js
const moment = require('moment')
const cartsModel = require('../models/cartsModel.js')
const productModel = require('../models/productModel.js')
const OrderModel = require('../models/orderModel.js')

const create = async (req, res) => {
  const dataReq = req.body

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

    let listCartId = listCart.map(item => item.id)

    // Lấy ra các mục giỏ hàng tương ứng với các sản phẩm được chọn
    const selectedItems = cart.items.filter((item) =>
      listCartId.includes(item._id.toString()),
    )
    console.log('selectedItems', selectedItems)

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
    console.log('totalAmount', totalAmount)

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
    await cart.save();

    // res.status(200).json({ status: 1, message: 'Đơn hàng đã được tạo thành công', order: newOrder });
  } catch (error) {
    console.log(error)
  }

  // Xử lý tạo phiên thanh toán
  const embed_data = {
    redirecturl: `${process.env.ZALOPAY_REDIRECT_URL}`,
  }
  console.log(dataReq)
  const items = [dataReq]
  const transID = Math.floor(Math.random() * 1000000)
  const order = {
    app_id: process.env.ZALOPAY_APP_ID,
    app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
    app_user: dataReq.userId,
    app_time: Date.now(), // miliseconds
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: dataReq.totalAmount,
    description: `Payment for the order #${transID}`,
    bank_code: '',
    callback_url: `${process.env.ZALOPAY_CALLBACK_URL}/payment/callback`,
  }

  // appid|app_trans_id|appuser|amount|apptime|embeddata|item
  const data =
    process.env.ZALOPAY_APP_ID +
    '|' +
    order.app_trans_id +
    '|' +
    order.app_user +
    '|' +
    order.amount +
    '|' +
    order.app_time +
    '|' +
    order.embed_data +
    '|' +
    order.item
  order.mac = CryptoJS.HmacSHA256(data, process.env.ZALOPAY_KEY_1).toString()

  try {
    const result = await axios.post(process.env.ZALOPAY_ENDPOINT, null, {
      params: order,
    })
    res.status(200).json(result.data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const callbackPayment = async (req, res) => {
  let result = {}
  // console.log('req', req.body.data)
  try {
    let dataStr = req.body.data
    let reqMac = req.body.mac

    let mac = CryptoJS.HmacSHA256(dataStr, process.env.ZALOPAY_KEY_2).toString()

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1
      result.return_message = 'mac not equal'
    } else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr, process.env.ZALOPAY_KEY_2)
      console.log(dataJson)
      // console.log(
      //   "update order's status = success where app_trans_id =",
      //   dataJson['app_trans_id'],
      // )

      result.return_code = 1
      result.return_message = 'success'
    }
  } catch (ex) {
    result.return_code = 0 // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message
  }

  // thông báo kết quả cho ZaloPay server
  res.json(result)
}

module.exports = {
  create,
  callbackPayment,
}
