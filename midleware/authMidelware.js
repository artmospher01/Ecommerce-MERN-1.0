import jwt from "jsonwebtoken";
import userSchema from "../model/userSchema.js";
// import userSchema from "../model/userSchema";

export const requiredLogin = (req, res, next) => {
  try {
    const decode = jwt.verify(
      req.headers.authorization,
      process.env.JWT_KEY_TOKEN
    );
    // console.log(req.headers.authorization);
    // console.log(decode);

    req.user = decode;

    next();
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      message: "your not login yet",
    });
  }
};

//admin panel

export const isAdmin = async (req, res, next) => {
  try {
    const userAdmin = await userSchema.findById(req.user._id);
    if (userAdmin.role != 1) {
      res.status(404).json({
        success: false,
        message: "Unautorized Access, your not admin ",
      });
    } else {
      // res.status(200).json({
      //   success: true,
      //   message: "acces admin",
      // });
      next();
    }
  } catch (err) {
    console.log(err);
  }
};
