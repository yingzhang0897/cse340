const utilities = require(".")
const accountModel = require("../models/inventory-model")
const { body, validationResult} = require("express-validator")
const validate  = {}

/*  **********************************
  *  Add Classification Validation Rules
  * ********************************* */
validate.addClassificationRules = () => {
    return [
      // classification_name is required and must be string
      body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .matches(/^[A-Za-z]+$/)
        .withMessage("Please provide a classification name with only alphabetic characters.") // on error this message is sent.
    ]
}

/* ******************************
 * Check classification name and return errors
 * OR  continue to add classification
 * ***************************** */
validate.checkClassificationName = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        errors,
        title: "Add Classification",
        nav,
        classification_name,
      })
      return //return errors
    }
    next() //continue adding classification
  }

/*  **********************************
  *  Add Classification Validation Rules
  * ********************************* */
validate.addVehicleRules = () => {
  return [
    body("inv_make").trim().escape().isLength({ min: 3 }).withMessage("Make name with at least 3 characters is required."),
    body("inv_model").trim().escape().isLength({ min: 3 }).withMessage("Model name with at least 3 characters is required."),
    body("inv_year").trim().escape().matches(/^\d{4}$/).withMessage("Year must be a 4-digit number."),
    body("inv_description").trim().escape().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().escape().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().escape().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price").trim().escape().isFloat({ min: 0 }).withMessage("Price can be integer or decimal."),
    body("inv_miles").trim().escape().matches(/^[1-9]\d*$/).withMessage("Miles must be digits only."),
    body("inv_color").trim().escape().notEmpty().withMessage("Color is required.")
  ]
}

/* ******************************
 * Check vehicle data and return errors
 * OR  continue to add vehicle
 * ***************************** */
validate.checkVehicleData = async (req, res, next) => {
  const { inv_make, inv_model , inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(); 
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
    return //return errors
  }
  next() //continue adding vehicle
}

/*  **********************************
*  Update Vehicle Validation Rules
* ********************************* */
validate.updateInventoryRules = () => {
  return [
    body("inv_make").trim().escape().notEmpty().withMessage("Make name with at least 3 characters is required."),
    body("inv_model").trim().escape().notEmpty().withMessage("Model name with at least 3 characters is required."),
    body("inv_year").trim().escape().notEmpty().withMessage("Year must be a 4-digit number."),
    body("inv_description").trim().escape().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().escape().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().escape().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price").trim().escape().notEmpty().withMessage("Price can be integer or decimal."),
    body("inv_miles").trim().escape().notEmpty().withMessage("Miles must be a digits only."),
    body("inv_color").trim().escape().notEmpty().withMessage("Color is required.")
  ]
}

/* ******************************
 * Check updated vehicle data and return errors
 * OR  continue to update vehicle
 * ***************************** */
validate.checkUpdatedVehicleData = async (req, res, next) => {
  const { inv_make, inv_model , inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + `${inv_make} ${inv_model}`,
      nav,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      inv_id,
    })
    return //return errors
  }
  next() //continue adding vehicle
}

module.exports = validate
  
