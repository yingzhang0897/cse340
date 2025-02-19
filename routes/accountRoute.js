const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require("../utilities/account-validation")

router.get("/login",utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
//account management 
router.get("/", utilities.checkJWTToken, utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))
//update 
router.get("/update/:accountId", utilities.checkJWTToken, utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount))
//logout
router.get("/logout", utilities.handleErrors(accountController.logoutAccount))


//process registration data
router.post("/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))
// Process the login attempt
router.post("/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.loginAccount))
// Process to Update Account Information
router.post(
    "/update",
    utilities.checkJWTToken,
    utilities.checkLogin,
    regValidate.updateAccountRules(),
    regValidate.checkUpdateAccountData,
    utilities.handleErrors(accountController.updateAccountInfo))
// Process to Update Password
router.post(
    "/update-password",
    utilities.checkJWTToken,
    utilities.checkLogin,
    regValidate.updatePasswordRules(),
    regValidate.checkUpdatePasswordData,
    utilities.handleErrors(accountController.updatePassword))

   
//enhancement route for managing accounts-Admin only
router.get("/Admin", 
    utilities.checkJWTToken, 
    utilities.checkLogin,
    utilities.checkAdmin, 
    utilities.handleErrors(accountController.adminManagement)
)
//get accounts JSON by type
router.get("/getAccounts/:account_type",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.checkAdmin, 
    utilities.handleErrors(accountController.getAccountsJSON))
//build Admin  update account view
router.get("/Admin/update/:accountId", 
    utilities.checkJWTToken, 
    utilities.checkLogin, 
    utilities.checkAdmin,
    utilities.handleErrors(accountController.adminBuildUpdateAccount))

//Admin process updating account info
router.post(
    "/Admin/update",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.checkAdmin,
    regValidate.updateAccountRules(),
    regValidate.checkUpdateAccountData,
    utilities.handleErrors(accountController.adminUpdateAccountInfo))
// Admin process updating password
router.post(
    "/Admin/update-password",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.checkAdmin,
    regValidate.updatePasswordRules(),
    regValidate.checkUpdatePasswordData,
    utilities.handleErrors(accountController.adminUpdatePassword))


    //delete account view
router.get("/Admin/delete/:accountId",
    utilities.checkJWTToken, 
    utilities.checkLogin,
    utilities.checkAdmin, 
    utilities.handleErrors(accountController.adminBuildDeleteAccount)
)
//process deleting account
router.post("/Admin/delete",
    utilities.checkJWTToken, 
    utilities.checkLogin,
    utilities.checkAdmin, 
    utilities.handleErrors(accountController.adminDeleteAccount)
)

module.exports = router