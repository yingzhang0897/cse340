const pool = require("../database/")

/* ***************************
 *  Get all classification data week2
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id week2
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error: " + error)
  }
}

/* ***************************
 *  Get vehicle details by inv_id week3
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory
       WHERE inv_id = $1`,[inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getVehicleById error: " + error)
  }
}

/* ***************************
 * Add Classification week4
 * ************************** */
async function insertClassification(classification_name) {
  try {
      const sql = `INSERT INTO classification (classification_name) VALUES ($1)`;
      await pool.query(sql, [classification_name]);
      return true;
  } catch (error) {
      console.error("model error: " + error);
      return false;
  }
}

/* ***************************
 * Add inventory Item week4
 * ************************** */
async function insertVehicle(
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
) {
  try {
    const sql =
      `INSERT INTO public.inventory (inv_make, inv_model , inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
    const data = await pool.query(sql, [
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
    ])
    return true;

  } catch (error) {
    console.error("model error: " + error)
    return false;
  }
}

/* ***************************
 * Update Inventory Data week5
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_year = $3, inv_description = $4, inv_image = $5, inv_thumbnail = $6, inv_price = $7,  inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}


/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    new Error("Delete Inventory Error: " + error)
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, insertClassification, insertVehicle, updateInventory, deleteInventory}
