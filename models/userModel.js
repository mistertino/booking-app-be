const mongoose = require( 'mongoose')

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
    },
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    password: {
      type: String,
      require: true,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    staff: {
      type: Boolean,
      default: false,
    },
    listPermission: []
  },
  { timestamps: true },
)

const userModel = mongoose.model('users', UserSchema);
module.exports = userModel;

