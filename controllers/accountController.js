const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null, // originally call should not have error
    } ) 
}
/* ****************************************
*  Deliver register view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Registration",
        nav,
        errors: null, // originally call should not have error
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    //collects and stores the values
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.')
      res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
        req.flash(
          "notice",
          `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
          title: "Login",
          nav,
          errors: null,
        })
      } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
          title: "Registration",
          nav,
          errors: null,
        })
      }
    }

/* ****************************************
*  Process login unit 5
* *************************************** */
async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const {account_email, account_password} = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if(!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return //return control back to the project process, the view does not hang
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {expiresIn: 3600 * 1000})
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, {httpOnly: true, maxAge: 3600 * 1000})
      } else {
        res.cookie("jwt", accessToken, {httpOnly: true, secure: true, maxAge: 3600 * 1000})
      }
      return res.redirect("/account/") //account management view
    }
  } catch (error) {
    return new Error('Access Firbidden')
  }
}

/* ****************************************
*  account management unit 5
* *************************************** */
async function accountManagement(req, res) {
  let nav = await utilities.getNav();
  try {
    if (!res.locals.loggedin) { // If user is NOT logged in, redirect
      req.flash("notice", "You must be logged in to access your account.");
      return res.redirect("/account/login");
    }

    // User is logged in, render the account management page
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
    });
  } catch (error) {
    throw new Error(error.message); 
  }
}

async function logoutAccount(req, res) {
  try {
    res.clearCookie("jwt"); // Remove JWT authentication token
    req.flash("notice", "You have been logged out.");
    return res.redirect("/"); // Redirect to home page
  } catch (error) {
    req.flash("notice", "Logout failed. Try again.");
    res.redirect("/account/");
  }
};

async function buildAccountManagement(req, res) {
  try {
    let nav = await utilities.getNav()
    // Ensure user is logged in
    if (!res.locals.accountData) {
      req.flash("notice", "Please log in to access your account.");
      return res.redirect("/account/login");
    }
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      accountData: res.locals.accountData // Pass accountData to view
    });
  } catch (error) {
    req.flash("notice", "Server error: " + error.message);
  }
}

async function buildUpdateAccount(req, res) {
  try {
    let account_id = parseInt(req.params.accountId)
    let nav = await utilities.getNav()
     // Ensure user is logged in
    if (!res.locals.accountData || res.locals.accountData.account_id !== account_id) {
    req.flash("notice", "Unauthorized access.");
    return res.redirect("/account/");
    }
    res.render("account/edit-account", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: res.locals.accountData // Pass user data to view
    });
  } catch (error) {
    req.flash("notice", "Server error: " + error.message);
    res.redirect("/account/");
  }
}

// Process Account Information Update
async function updateAccountInfo(req, res) {
  try {
    let { account_firstname, account_lastname, account_email} = req.body;
    let account_id = res.locals.accountData.account_id; //Get ID from logged-in user

    const updatedAccount = await accountModel.updateAccountInfo(account_firstname, account_lastname, account_email, account_id);

    if (updatedAccount) {
      req.flash("notice", "Account updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Update failed.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    req.flash("notice", "Server error: " + error.message);
    res.redirect(`/account/update/${account_id}`);
  }
}

async function updatePassword(req, res) {
  try {
    let {new_password } = req.body;
    let account_id = res.locals.accountData.account_id; //Get ID from logged-in user

      // Hash new password
    const hashedPassword = await bcrypt.hashSync(new_password, 10);
    const updatedPassword = await accountModel.updatePassword(hashedPassword, account_id);
    if (updatedPassword) {
      req.flash("notice", "Password updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Password update failed.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    req.flash("notice", "Server error: " + error.message);
    res.redirect(`/account/update/${account_id}`);
  }
}

module.exports = {buildLogin, buildRegister, registerAccount, loginAccount, accountManagement,logoutAccount,buildAccountManagement, buildUpdateAccount, updateAccountInfo, updatePassword}