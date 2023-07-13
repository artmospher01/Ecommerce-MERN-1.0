import express from "express";
import {

  ChangeStatusOrder,
  getAllOrders,
  handleForgetPassword,
  handleUpdateUser,
  logInHandler,
  orderHandler,
  registerHandler,
  testAuthLogin,
} from "../controler/userHandler.js";
import { isAdmin, requiredLogin } from "../midleware/authMidelware.js";

const route = express.Router();

// register || post
route.post("/register", registerHandler);

// login || post
route.post("/login", logInHandler);

// test
route.get("/test", requiredLogin, isAdmin, testAuthLogin);

// protect auth routh
route.get("/user-auth", requiredLogin, (req, res) => {
  res.status(200).json({ ok: true })
})

// forget password
route.post("/forget-password", handleForgetPassword)

// admin panel
route.get("/admin-auth", requiredLogin, isAdmin, (req, res) => {
  res.status(200).json({ ok: true })
})

// update user
route.put("/update-user", requiredLogin, handleUpdateUser)

// order
route.get("/order", requiredLogin, orderHandler)

// get all orders
route.get("/all-orders", requiredLogin, isAdmin, getAllOrders)

// change status order
route.put("/change-status/:id", requiredLogin, isAdmin, ChangeStatusOrder)

export default route;
