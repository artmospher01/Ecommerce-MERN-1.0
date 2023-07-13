import mongoose from "mongoose";


const orderShcema = mongoose.Schema({
  product: [

    {
      type: mongoose.ObjectId,
      ref: "product"
    }
  ],
  payment: {},
  buyer: {
    type: mongoose.ObjectId,
    ref: "user"
  },
  status: {
    type: String,
    default: "not process",
    enum: ["not process", "process", "processing", "shipped", "deliverd", "cancel"]
  },
}, { timestamps: true })

export default mongoose.model("order", orderShcema)
