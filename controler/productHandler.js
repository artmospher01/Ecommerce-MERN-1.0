import slugify from "slugify"
import productShcema from "../model/productShcema.js"
import fs from "fs"
import braintree, { Environment } from "braintree"
import orderShcema from "../model/orderShcema.js";
import env from "dotenv"
import mongoose from "mongoose";



// =====================================================

env.config()
// token payment braintree
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

// ===========Create product
async function createProductHandler(req, res, next) {
  try {
    const { name, description, category, price, quantity, shipping } = req.fields
    const { photo } = req.files

    switch (true) {
      case (!name): return res.status(400).json({ message: "name is required" })
      case (!description): return res.status(400).json({ message: "description is required" })
      case (!category): return res.status(400).json({ message: "category is required" })
      case (!price): return res.status(400).json({ message: "price is required" })
      case (!quantity): return res.status(400).json({ message: "quantity is required" })
      case (!shipping): return res.status(400).json({ message: "shipping is required" })
      case (photo && photo.size > 1000000): return res.status(400).json({ message: "photo required & less then 1 mb" })
    }


    const product = await new productShcema({
      ...req.fields,
      slug: slugify(name)
    })

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path)

      product.photo.contentType = photo.type
    }
    await product.save()

    res.status(200).json({
      success: true,
      message: "create product successfull",
      product
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "cannot create product, server eror",
      error
    })
  }
}

// ==================================================================
// ================= get all product

async function allProductHandler(req, res) {
  try {
    const products = await productShcema.find({}).select("-photo").populate("category").limit(12).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      message: "get all product is successfull",
      products
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "cannot get all product, server eror"
    })
  }
}

// ===================================================
// ============ get single product
async function singleProductHandler(req, res, next) {
  try {
    const product = await productShcema.findOne({ slug: req.params.slug }).select("-photo").populate("category")
    res.status(200).json({
      success: true,
      message: "get single product is succsessfull",
      product
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "cannot ger single product, server eror"
    })
  }
}

// ============================================================
// =========== get photo
async function photoProductHandler(req, res) {
  try {
    const product = await productShcema.findById(req.params.id).select("photo")

    if (product.photo.data) {
      res.type(product.photo.contentType);
      res.status(200).send(product.photo.data);
    }


  } catch (error) {
    res.status(500).json({
      success: false,
      message: "cannot get photo of product, server eror"
    })
  }
}

// ==============================================================
// ======= delete product
async function deleteProductHandler(req, res) {
  try {
    const product = await productShcema.findByIdAndDelete(req.params.id).select("-photo")

    res.status(200).json({
      success: true,
      message: "delete product is successfull",
      product
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "cannot delete product, server eror"
    })
  }
}

// ==================================================================
// ============= update / edit product

async function updatProductHandler(req, res) {
  try {

    const { name, description, category, price, quantity, shipping } = req.fields
    const { photo } = req.files


    switch (true) {
      case !name: return res.status(400).json({ message: "name is required" })
      case !description: return res.status(400).json({ message: "description is required" })
      case !price: return res.status(400).json({ message: "price is required" })
      case !category: return res.status(400).json({ message: "category is required" })
      case !quantity: return res.status(400).json({ message: "quantity is required" })
      case (!shipping): res.status(400).json({ message: "shipping is required" })
      case photo && photo.size > 1000000: return res.status(400).json({ message: "photo required & less then 1 mb" })
    }

    const newProduct = await productShcema.findByIdAndUpdate(req.params.id, {
      ...req.fields,
      slug: slugify(name)
    }, { new: true })

    if (photo) {
      newProduct.photo.data = fs.readFileSync(photo.path)
      newProduct.photo.contentType = photo.type
    }

    await newProduct.save()


    res.status(200).json({
      success: true,
      message: "update/edit product is succesfull",
      newProduct
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "cannot update product, server eror ",
      error
    })

  }
}


// ==================================================================
// ============= filter category and price

const filterCategoryPrice = async (req, res) => {
  try {
    let args = {}
    const { filterCategory, filterPrice } = req.body
    if (filterCategory.length > 0) args.category = filterCategory
    if (filterPrice.length) args.price = { $gte: filterPrice[0], $lte: filterPrice[1] }
    const products = await productShcema.find(args)
    res.status(200).json({
      success: true,
      message: "filter product is succesfull",
      products,
      totalFilter: products.length
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "filter eror",
      error
    })
  }
}

// ==================================================================
// ============= Load more
const countingProduct = async (req, res) => {

  try {
    const total = await productShcema.find({}).estimatedDocumentCount()
    res.status(200).json({
      success: true,
      message: "counting product is succesfull",
      total
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "count eror",
      error
    })
  }
}

const morePageHandler = async (req, res) => {
  try {
    const perPage = 6
    const page = req.params.page ? req.params.page : 1
    let product = []


    page == 1 ? (product = await productShcema.find({}).select("-photo").limit(perPage).sort({ createdAt: -1 })
    ) : product = await productShcema.find({}).select("-photo").skip((page - 1) * perPage).limit(perPage).sort({ createdAt: -1 })


    res.status(200).json({
      success: true,
      message: "more page product is succesfull",
      product
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "running more Page eror",
      error
    })
  }

}


// after filter more page 
const afterFilterMorePage = async (req, res) => {
  try {

    let args = {}
    const { filterCategory, filterPrice } = req.body
    if (filterCategory.length > 0) args.category = filterCategory
    if (filterPrice.length) args.price = { $gte: filterPrice[0], $lte: filterPrice[1] }
    const perPage = 6
    const page = req.params.page ? req.params.page : 1
    let product = []


    page == 1 ? (product = await productShcema.find(args).select("-photo").limit(perPage).sort({ createdAt: -1 })
    ) : product = await productShcema.find(args).select("-photo").skip((page - 1) * perPage).limit(perPage).sort({ createdAt: -1 })


    res.status(200).json({
      success: true,
      message: "more page product is succesfull",
      product,
      totalFilter: product.length
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "running more Page eror",
      error
    })
  }
}

// =========================================================================
// ======Search Filter
const searchProductHandler = async (req, res) => {
  try {
    const { keyword } = req.params

    const result = await productShcema.find({
      $or: [
        {
          name: {
            $regex: keyword,
            $options: "i"
          }
        },
        {
          description: {
            $regex: keyword,
            $options: "i"
          }
        },
      ],
    }).select("-photo")
    if (!result) {
      res.status(400).json({
        success: false,
        message: "product is not found",
      })
    } else {
      res.status(200).json({
        success: true,
        message: "searching product is successsfull",
        result,
        keyword
      })

    }

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "searching product eror",
      error
    })
  }

}
const similarProduct = async (req, res) => {
  try {
    const { id, categoryID } = req.params
    const product = await productShcema.find({
      category: categoryID,
      _id: { $ne: id }
    }).select("-photo").limit(3).populate("category")
    if (product) {
      res.status(200).json({
        success: true,
        message: "get similar product is successfull",
        product

      })
    }

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "something is wrong",
      error
    })
  }
}

const braintreeToken = async (req, res) => {
  try {
    gateway.clientToken.generate((err, respone) => {
      if (err) console.log(err)
      else {
        res.send(respone)
      }
    })

  } catch (error) {
    console.log(error)
  }
}
const braintreePayment = async (req, res) => {
  try {
    const { Cart, nonce } = req.body;
    let total = 0
    Cart.map(a => total += a.price)

    let newTransaction = gateway.transaction.sale({
      amount: total,
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true
      }
    }, function (err, result) {
      if (err) {
        console.log(err)
        return
      } else {
        if (result) {
          const order = new orderShcema({
            product: Cart,
            payment: result,
            buyer: req.user._id
          }).save()
          res.status(200).json({
            success: true,
          })
        }
      }
    })

  } catch (error) {
    console.log(error)
  }
}





export {
  createProductHandler, allProductHandler, singleProductHandler,
  photoProductHandler, deleteProductHandler, updatProductHandler,
  filterCategoryPrice, countingProduct, morePageHandler, afterFilterMorePage,
  searchProductHandler, similarProduct, braintreePayment, braintreeToken
}