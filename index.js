const express = require( 'express')
const bodyParser = require( 'body-parser')
const mongoose = require( 'mongoose')
const dotenv = require( 'dotenv')
const cors = require( 'cors')

//import router
const AuthRoute = require( './Routes/AuthRoute.js')
const ProductRoute = require( './Routes/ProductRoute.js')
const UserRoute = require( './Routes/UserRoute.js')
const PaymentRoute = require( './Routes/PaymentRoute.js')
const OrderRoute = require( './Routes/OrderRoute.js')
const CategoryRoute = require( './Routes/CategoryRoute.js')

const app = express()
app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cors())

dotenv.config()

//Kết nối DB, khởi động server
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(process.env.PORT || 5000, () =>
      console.log(
        `Connected to MongoDB - Sever on localhost:${process.env.PORT}`,
      ),
    ),
  )

//routes
app.use('/auth', AuthRoute)
app.use('/product', ProductRoute)
app.use('/user', UserRoute)
app.use('/category', CategoryRoute)
app.use('/payment', PaymentRoute)
app.use('/order', OrderRoute)
