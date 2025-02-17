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
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
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
    let account_id = res.locals.accountData.account_id; //Get ID from logged-in user
    let { account_firstname, account_lastname, account_email} = req.body;

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
    let account_id = res.locals.accountData.account_id; //Get ID from logged-in user
    let {new_password, confirm_password } = req.body;
    
    if (new_password !== confirm_password) {
      req.flash("notice", "Passwords do not match.");
      return res.redirect(`/account/update-password`);
    }
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

/* ***************************
 *  Return accounts by type As JSON final enhancement
 * ************************** */
async function getAccountsJSON(req, res, next) {
  console.log("Received params:", req.params); // Debugging
  
  const account_type = req.params.account_type;
  if (!account_type) {
    console.error("Error: account_type is undefined.");
    return res.status(400).json({ error: "Invalid account type" });
  }

  try {
    const accountData = await accountModel.getAccountsByType(account_type);
    console.log("Fetched account data:", accountData);

    if (!accountData || accountData.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    return res.json(accountData);
  } catch (error) {
    console.error("Database error:", error);
    next(error);
  }
}


/* ***************************
 * Build admin management view 
 * ************************** */
async function adminManagement(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const accountTypeList = utilities.buildAccountTypeList()
    // Ensure user is logged in
    if (!res.locals.accountData) {
      req.flash("notice", "Please log in to access your account.");
      return res.redirect("/account/login");
    }
    console.log("Account Type List Generated:", accountTypeList);// debug
    res.render("account/admin", {
      title: "Admin Management",
      nav,
      accountData: res.locals.accountData,// Pass accountData to view
      errors: null,
      accountTypeList: accountTypeList,
    })
  } catch (error) {
    req.flash("notice", "Server error: " + error.message);
    return res.redirect("/account/");
  }
}

/* ***************************
 *  Build delete account view final enhancement
 * ************************** */
async function buildDeleteAccount(req, res, next) {
 const account_id = parseInt(req.params.accountId)
 let nav = await utilities.getNav()
 const accountData = await accountModel.getAccountById(account_id)
 const accountName = `${accountData.account_firstname} ${accountData.account_lastname}`
 res.render("account/delete-confirm", {
  title: "Delete " + accountName,
  nav,
  errors: null,
  account_id: accountData.account_id,
  account_firstname: accountData.account_firstname,
  account_lastname: accountData.account_lastname,
  account_email: accountData.account_email,
  account_type: accountData.account_type,
 })
}
/* ***************************
 *  Delete Account Data final enhancement
 * ************************** */
async function deleteAccount(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.body.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  const accountName = `${accountData.account_firstname} ${accountData.account_lastname}`

  const deleteAccount= await accountModel.deleteAccount(account_id)
  if (deleteAccount) {
    req.flash("notice", `${accountName} was successfully deleted.`)
    res.redirect("account/manage")
  } else {
    req.flash("notice", "Sorry, the deletion failed.")
    res.redirect("account/delete/account_id")
  }

}

module.exports = {buildLogin, buildRegister, registerAccount, loginAccount, accountManagement,logoutAccount,buildAccountManagement, buildUpdateAccount, updateAccountInfo, updatePassword, getAccountsJSON, adminManagement, buildDeleteAccount, deleteAccount}