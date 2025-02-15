const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult} = require("express-validator")
const validate  = {}

/*  **********************************
  *  Registration Data server-side Validation Rules week4
  * ********************************* */
validate.registrationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

      // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if(emailExists) {
          throw new Error("Email exists. Please log in or provide a different email")
        }
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check data and return errors or continue to registration week4
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email, //sticky
      })
      return //the view in the browser does not "hang"
    }
    next() //next step in post route
}
  
/*  **********************************
  *  Login Data server-side Validation Rules week4
  * ********************************* */
validate.loginRules = () => {
  return [
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if(!emailExists) {
          throw new Error("Email is not registered. Please sign up first")
        }
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements.")
  ]
}

/* ******************************
 * Check login data and return errors week4
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email, account_password } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email, //sticky
    })
    return //the view in the browser does not "hang"
  }
  next() //next step in post route
}

validate.updateAccountRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

      // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
    
  ]
}

validate.checkUpdateAccountData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/edit-account", {
      errors,
      title: "Edit Account",
      nav,
      account_firstname,
      account_lastname,
      account_email, //sticky
    })
    return //the view in the browser does not "hang"
  }
  next() //next step in post route
}

validate.updatePasswordRules = () => {
  return [
    body("new_password")
    .trim()
    .notEmpty()
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password must be at least 12 characters long and contain an uppercase letter, a number, and a symbol."),
  
    body("confirm_password")
        .trim()
        .notEmpty()
        .custom((value, { req }) => value === req.body.new_password)
        .withMessage("Passwords do not match.")
  ]
}

validate.checkUpdatePasswordData = async (req, res, next) => {
  const { new_password, confirm_password } = req.body;

  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/edit-account", {
      title: "Update Password",
      nav,
      errors,
      accountData: { account_id: req.params.accountId },
    });
    return;
  }
  next();
};

module.exports = validate
  