const mongoose = require( 'mongoose')

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    cart: [],
  },
  { timestamps: true },
)

const userModel = mongoose.model('users', UserSchema);
module.exports = userModel;

