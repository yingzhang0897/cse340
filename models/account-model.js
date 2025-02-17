const pool = require("../database/")

/* *****************************
*   Register new account week4
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }

/* **********************
 *   Check for existing email week4
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}
/* **********************
 *  login process activity unit 5
 * ********************* */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1', [account_email])
      return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

async function updateAccountInfo(account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql = `
      UPDATE public.account
      SET account_firstname = $1, account_lastname = $2, account_email = $3 
      WHERE account_id = $4 RETURNING *`;
    const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    return data.rows[0]
  } catch (error) {
    console.error("Database error:", error);
  }
}

async function updatePassword(hashedPassword, account_id) {
  try {
    const sql = `
      UPDATE public.account
      SET account_password = $1 
      WHERE account_id = $2 RETURNING *`;
    const data = await pool.query(sql, [hashedPassword, account_id]);
    return data.rows[0]
  } catch (error) {
    console.error("Database error:", error);
  }
}

//final enhancement
async function getAccountsByType(account_type) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type
      FROM public.account
      WHERE account_type = $1
      ORDER BY account_lastname;
    `;
    const result = await pool.query(sql, [account_type]);

    return result.rows; // Return array of accounts
  } catch (error) {
    console.error("Database error in getAccountsByType:", error);
    return [];
  }
}

/* ***************************
 *  Delete account
 * ************************** */
async function deleteAccount(account_id) {
  try {
    const sql = "DELETE FROM public.account WHERE account_id = $1";
    const data = await pool.query(sql, [account_id])
  return data
  } catch (error) {
    new Error("Delete Account Error: " + error)
  }
}

/* **********************
 *  get accountData by accountID final enhancement
 * ********************* */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1', [account_id])
      return result.rows[0]
  } catch (error) {
    return new Error("No matching account_id found")
  }
}



module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, updateAccountInfo, updatePassword, getAccountsByType, deleteAccount, getAccountById}
