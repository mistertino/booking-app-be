const mongoose = require( 'mongoose')


const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const categoryModel = mongoose.model("categories", CategorySchema);
module.exports = categoryModel;

