const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = parseInt(req.params.classificationId)
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}
/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.getInventoryDetail = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  const vehicle = await invModel.getVehicleById(inv_id)
  const flex = await utilities.buildVehicleDetail(vehicle)
  let nav = await utilities.getNav()
  res.render("inventory/detail", {
    title: vehicle.inv_make + ' ' + vehicle.inv_model,
    nav,
    flex,
  })
}

/* ***************************
 * Build inventory management view 
 * ************************** */
invCont.invManagement = async function (req, res){
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/inventory-management", {
    title: "Inventory Management",
    nav,
    errors: null,
    classificationList,
  })
}

/* ***************************
 * Deliver add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
    } ) 
}

/* ***************************
 * Process adding classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  let { classification_name } = req.body;

  try {
      let success = await invModel.insertClassification(classification_name);

      if (success) {
          req.flash("notice", `New classification ${classification_name} added successfully!`);
          await utilities.updateNav(); // Regenerate the navigation bar
          return res.redirect("/inv");
      } else {
          req.flash("notice",  `Error adding new classification${classification_name}.`);
          return res.redirect("/inv/add-classification");
      }
  } catch (error) {
      req.flash("notice", "Server error: " + error.message);
      return res.redirect("/inv/add-classification");
  }  
}
/* ***************************
 * Deliver add vehicle view
 * ************************** */
invCont.buildAddVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "",
      inv_thumbnail: "",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
  } ) 
}

/* ***************************
 * Process adding vehicle
 * ************************** */
invCont.addVehicle = async function (req, res, next) {
  let { inv_make, inv_model, inv_year,  inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
  classification_id = parseInt(classification_id);

  try {
      let success= await invModel.insertVehicle(inv_make, inv_model, inv_year,  inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);

      if (success) {
          req.flash("notice", " New vehicle added successfully!");
          return res.redirect("/inv");
      } else {
          req.flash("notice", "Error adding new vehicle.");
          return res.redirect("/inv/add-inventory");
      }
  } catch (error) {
      req.flash("notice", "Server error: " + error.message);
      return res.redirect("/inv/add-inventory");
  }  
}

/* ***************************
 *  Return Inventory by Classification As JSON week5
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classificationId)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view week5
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ***************************
 *  Update Inventory Data week5
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let {
    inv_id, 
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body
  inv_price = parseInt(inv_price);
  inv_miles = parseInt(inv_miles);//req.body is default string
  const updateResult = await invModel.updateInventory( 
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
    inv_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationList= await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList: classificationList,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Build delete inventory view week5
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Delete Inventory Data week5
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)
  const itemData = await invModel.getVehicleById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

   
  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the deletion failed.")
    res.redirect("inv/delete/inv_id")   
  }
}


module.exports = invCont
