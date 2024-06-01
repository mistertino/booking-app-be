const mongoose = require( 'mongoose')


const CartsSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    items: [
        {productId: ObjectId}
    ],
  },
  { timestamps: true }
);

const cartsModel = mongoose.model("carts", CartsSchema);
module.exports = cartsModel;

