const axios = require('axios').default // npm install axios
const CryptoJS = require('crypto-js') // npm install crypto-js
const moment = require('moment')


const create = async (req, res) => {
  const dataReq = req.body

  const embed_data = {
    redirecturl: `${process.env.ZALOPAY_REDIRECT_URL}`,
  }

  const items = dataReq.listCart
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
    const result = await axios.post(process.env.ZALOPAY_ENDPOINT, null, { params: order })
    res.status(200).json(result.data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const callbackPayment = async (req, res) => {
  let result = {}
  console.log('req', req.body.data)
  try {
    let dataStr = req.body.data
    let reqMac = req.body.mac

    let mac = CryptoJS.HmacSHA256(dataStr, process.env.ZALOPAY_KEY_2).toString()
    console.log('mac =', mac)

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1
      result.return_message = 'mac not equal'
    } else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      // let dataJson = JSON.parse(dataStr, process.env.ZALOPAY_KEY_2)
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
