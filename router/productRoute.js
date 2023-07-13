import express from "express"
import { afterFilterMorePage, allProductHandler, braintreePayment, braintreeToken, countingProduct, createProductHandler, deleteProductHandler, filterCategoryPrice, morePageHandler, photoProductHandler, searchProductHandler, similarProduct, singleProductHandler, updatProductHandler } from "../controler/productHandler.js"

import { isAdmin, requiredLogin } from "../midleware/authMidelware.js"
import formidableMiddleware from "express-formidable"



const route = express.Router()

// ==== create [roduct]
route.post("/create-product", requiredLogin, isAdmin, formidableMiddleware(), createProductHandler)

// ==== get all product
route.get("/all-product", allProductHandler)

// ==== get single product
route.get("/single-product/:slug", singleProductHandler)

// ==== get photo product
route.get("/photo-product/:id", photoProductHandler)

// ==== get photo product
route.delete("/delete-product/:id", deleteProductHandler)

// ==== get photo product
route.put("/update-product/:id", requiredLogin, isAdmin, formidableMiddleware(), updatProductHandler)

// ==== filter category and price
route.post("/filter-product", filterCategoryPrice)

// ==== counting product
route.get("/count-product", countingProduct)
// ==== counting product
route.get("/load-more/:page", morePageHandler)

// ==== after filter ore page
route.post("/load-more-filter/:page", afterFilterMorePage)

// ==== search product
route.get("/search-product/:keyword", searchProductHandler)

// ===== similar product
route.get("/similar-product/:id/:categoryID", similarProduct);

// braintree token
route.get("/payment-token", braintreeToken)

// braintree payment
route.post("/payment", requiredLogin, braintreePayment)


export default route