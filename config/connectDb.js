import mongoose from "mongoose";

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.URL_MONGO)
    console.log("connect to database")
  } catch (err) {
    console.log(`can't concect ${err}`)
  }

}

export default connectMongo