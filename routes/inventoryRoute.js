const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/");
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view week2
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

//Route to build vehicle detail view by inv_id week3
router.get("/detail/:invId", utilities.handleErrors(invController.getInventoryDetail));


//inventory management view week4
router.get("/", utilities.handleErrors(invController.invManagement))

//add classification view week4
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
//add vehicle view week4
router.get("/add-inventory", utilities.handleErrors(invController.buildAddVehicle))

//process adding classification  week4
router.post("/add-classification", 
    invValidate.addClassificationRules(), 
    invValidate.checkClassificationName, 
    utilities.handleErrors(invController.addClassification))

//process adding vehicle week4
router.post("/add-inventory", 
    invValidate.addVehicleRules(), 
    invValidate.checkVehicleData, 
    utilities.handleErrors(invController.addVehicle))

//Route to build select inventory view week5
router.get("/getInventory/:classificationId", utilities.handleErrors(invController.getInventoryJSON))
//edit inventory item view week5
router.get("/edit/:invId", utilities.handleErrors(invController.buildEditInventory));
// update inventry into database week5
router.post("/update-inventory",invValidate.updateInventoryRules(), invValidate.checkUpdatedVehicleData, utilities.handleErrors(invController.updateInventory));

//displaying delete confirmation page week5
router.get("/delete/:invId", utilities.handleErrors(invController.buildDeleteInventory));

// processing deleting vehicle week5
router.post("/delete-inventory", utilities.handleErrors(invController.deleteInventory));

module.exports = router;
