
import express from "express"
import { isAdmin, requiredLogin } from "../midleware/authMidelware.js"
import { UpdateCategoryHandler, allCategoryHandler, createCategoryHandler, deleteCategoryHandler, singleCategoryHandler } from "../controler/categoryHandler.js"

const route = express.Router()


// Create category
route.post("/create-category", requiredLogin, isAdmin, createCategoryHandler)

//  Update/edit categoru 
route.put("/update-category/:id", requiredLogin, isAdmin, UpdateCategoryHandler)

// get all category
route.get("/all-category", allCategoryHandler)

//  get singgle category
route.get("/single-category/:slug", singleCategoryHandler)

//  delete category
route.delete("/delete-category/:id", deleteCategoryHandler)

export default route