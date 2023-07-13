import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv"
import connectMongo from "./config/connectDb.js";
import userRoute from "./router/userRouter.js";
import categoryRoute from "./router/categoryRoute.js"
import productRoute from "./router/productRoute.js"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url";
// express config
const app = express()



// .env config
dotenv.config()

// connect to db
connectMongo()


// esmodule fix
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// midlewere
app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, "./client/build")))

// router connect
app.use("/api/ecommerce/v1", userRoute)
app.use("/api/ecommerce/v1/category", categoryRoute)
app.use("/api/ecommerce/v1/product", productRoute)


// rest api
app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"))
})

// debug 
const port = process.env.PORT
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})