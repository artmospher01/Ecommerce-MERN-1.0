import { compareSync, hash, hashSync } from "bcrypt";
import userSchema from "../model/userSchema.js";
import jwt from "jsonwebtoken";
import orderShcema from "../model/orderShcema.js";




// !=========================================================================
// !=========================Register

const registerHandler = async (req, res, next) => {
  const { username, email, password, address, answer } = req.body;
  try {
    if (!username && !email && !password && !address && !answer) {
      return res.status(404).json({
        success: false,
        message: "there is a stuf you'r not fild",
      });
    }

    const existingUser = await userSchema.findOne({ email });

    if (existingUser) {
      return res.status(404).json({
        success: false,
        message: "the email alredy exist, please logIn",
      });
    }

    // encrypt password
    const hastPassword = hashSync(password, 10);

    const newUser = await new userSchema({
      username,
      email,
      address,
      password: hastPassword,
      answer
    }).save();

    res.status(200).json({
      success: true,
      message: "create account is successfull",
      user: newUser,
    });
  } catch (err) {
    return console.log(err);
  }
};



//!======================================================================================
//! ==================== login
const logInHandler = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(404).json({
      success: false,
      message: "enter the correct input",
    });
  }
  // cek Email
  const user = await userSchema.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "email hasn't registed",
    });
  }
  //cek password
  const isCorectPassword = compareSync(password, user.password);
  if (!isCorectPassword) {
    return res.status(404).json({
      success: false,
      message: "password is wrong",
    });
  }

  // token
  const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY_TOKEN, {
    expiresIn: "7d",
  });

  res.status(200).json({
    success: true,
    message: "login is succesfull",
    user,
    token,
  });
};

// test authlogin
const testAuthLogin = (req, res, next) => {
  res.send("authentaion complete");
};





//! ======================================================================================
//! ============ forget password 

const handleForgetPassword = async (req, res, next) => {
  const { email, answer, newPassword } = req.body

  if (!email && !answer && !newPassword) {
    return res.status(400).json({
      success: false,
      message: "your email,answer,newPassword  is required"
    })
  }

  const user = await userSchema.findOne({ email, answer })

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "email / answer is wrong"
    })
  }
  const hashPassword = hashSync(newPassword, 10)

  const updateUser = await userSchema.findByIdAndUpdate(user._id, { password: hashPassword }, {
    returnOriginal: false
  })

  if (!updateUser) {
    return res.status(400).json({
      success: false,
      message: "update password failed"
    })
  }
  else {
    return res.status(200).json({
      success: true,
      message: "update password succesfull",
      user
    })
  }
}

// update user
const handleUpdateUser = async (req, res) => {
  try {
    const { username, password, address } = req.body
    const user = await userSchema.findById(req.user._id)

    if (password && password.length < 6) {
      return res.json({ message: "passeord is required & min 6 caracter long" })
    }
    const newPass = password ? hashSync(password, 10) : undefined
    const newUser = await userSchema.findByIdAndUpdate(req.user._id, {
      username: username || user.username,
      password: newPass || user.password,
      address: address || user.address
    }, { new: true })

    res.status(200).json({
      success: true,
      message: "update user is successfull",
      newUser
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "something is wrong",
      error
    })
  }
}

// order
const orderHandler = async (req, res) => {
  try {
    const order = await orderShcema.find({ buyer: req.user._id }).populate("product", "-photo").populate("buyer", "username")

    res.json(order)

  } catch (error) {
    console.log(error)
  }
}

// All Order
const getAllOrders = async (req, res) => {
  try {
    const allOrders = await orderShcema.find({}).populate("product", "-photo").populate("buyer", "username")
    res.json(allOrders)
  } catch (error) {
    console.log(error)
  }
}

// change status order
const ChangeStatusOrder = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const updateOrder = await orderShcema.findByIdAndUpdate(id, {
      status
    }, { new: true }).populate("product", "-photo").populate("buyer", "username")
    res.send(updateOrder)
  } catch (error) {
    console.log(error)
  }
}


export {
  registerHandler, logInHandler, testAuthLogin, handleForgetPassword, handleUpdateUser, orderHandler,
  getAllOrders, ChangeStatusOrder
};
