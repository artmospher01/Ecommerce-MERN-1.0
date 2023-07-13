import slugify from "slugify";
import categorySchema from "../model/categorySchema.js";
import { json } from "react-router-dom";



// ==========================================================================
// ==================== Create Category
async function createCategoryHandler(req, res, next) {

  try {
    const { name } = req.body

    if (!name) {
      res.status(400).json({
        success: false,
        message: "create category failed, name is required"
      })
    }

    // existing user
    const category = await categorySchema.findOne({ name })
    if (category) {
      res.status(400).json({
        success: false,
        message: "create category failed, name already exist "
      })
    }

    //  save category

    const SaveCategory = await new categorySchema({
      name,
      slug: slugify(name)
    }).save()

    res.status(200).json({
      success: true,
      message: "create category successfull",
      category: SaveCategory
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "create category failed, server eror"
    })
  }
}


// ==============================================================
// =============== update category

async function UpdateCategoryHandler(req, res, next) {
  try {
    const { name } = req.body
    const { id } = req.params

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "update failed, name is required"
      })
    }

    // cek name duplicat
    const category = await categorySchema.findOne({ name })
    if (category) {
      return res.status(400).json({
        success: false,
        message: "update failed, name is already"
      })
    }


    //  update categry
    const categoryUpdate = await categorySchema.findByIdAndUpdate(id, {
      name,
      slug: slugify(name)
    }, { new: true })

    if (!categoryUpdate) {
      return res.status(400).json({
        success: false,
        message: "update failed"
      })
    }

    res.status(200).json({
      success: true,
      message: "update is successfull",
      categoryUpdate
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "update failed, server eror"
    })
  }
}

// ======================================================
//========= get all category
async function allCategoryHandler(req, res, next) {

  try {
    const categories = await categorySchema.find({}).sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      message: "get all category is successfull",
      categories
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "cannot get all category,  server eror",
      error,
    })
  }

}



// ======================================================
//========= get single category
async function singleCategoryHandler(req, res, next) {
  const { slug } = req.params


  try {
    const category = await categorySchema.findOne({ slug })

    res.status(200).json({
      success: true,
      message: "get single category is successfull",
      category
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "cannot get single category, server eror"

    })
  }

}


// ======================================================
//========= delete category

async function deleteCategoryHandler(req, res, next) {
  const { id } = req.params
  try {
    const deletedCategory = await categorySchema.findByIdAndDelete(id)

    res.status(200).json({
      success: 200,
      message: "delete category is successfull",
      deletedCategory
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "cannot delete category, single eror",
      error
    })
  }

}



export { createCategoryHandler, UpdateCategoryHandler, allCategoryHandler, singleCategoryHandler, deleteCategoryHandler }