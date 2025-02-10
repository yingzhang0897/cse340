/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts") 
const env = require("dotenv").config()
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
//Require the Session package and DB connection
const session = require("express-session")
const pool = require('./database/')

const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/")
const errorRoute = require("./routes/errorRoute")

const app = express()

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware unit 4 activity
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

//collect the values from the incoming request body, unit4, processing registration activity
app.use(bodyParser.json()) //use the body parser to work with JSON
// "extended: true" allows rich objects and arrays to be parsed
app.use(bodyParser.urlencoded({extended: true}))// for parsing application/x-www-form-urlencoded

//unit 5 login acitivity
app.use(cookieParser())
//unit 5 login in process activity
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(require("./routes/static"))
//Index route
app.get('/', utilities.handleErrors(baseController.buildHome))
// Inventory route
app.use("/inv", require("./routes/inventoryRoute"))
//account route
app.use("/account", require("./routes/accountRoute"))
//error route
app.use("/error", require("./routes/errorRoute"))
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if (err.status == 404) {message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
