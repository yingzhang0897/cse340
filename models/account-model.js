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
      UPDATE accounts 
      SET account_firstname = $1, account_lastname = $2, account_email = $3 
      WHERE account_id = $4 RETURNING *`;
    const data = await pool.query(sql, [first_name, last_name, email, accountId]);
    return data.rows[0]
  } catch (error) {
    console.error("Database error:", error);
  }
}

async function updatePassword(hashedPassword, account_id) {
  try {
    const sql = `
      UPDATE accounts 
      SET password = $1 
      WHERE account_id = $2 RETURNING *`;
    const data = await pool.query(sql, [hashedPassword, account_id]);
    return data.rows[0]
  } catch (error) {
    console.error("Database error:", error);
  }
}

module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, updateAccountInfo, updatePassword}
