// My Forum
// A web application to provide discussion forums

// Import the modules we need
const express = require("express")
const pug = require("pug")
const bp = require("body-parser")
const cp = require("cookie-parser")
const mysql = require("mysql")

// Create the express application object
const app = express()
const port = 8000
app.use(bp.urlencoded({extended: true}))
app.use(cp())

// Define the database connection
const db = mysql.createConnection (
	{
	    host: 'localhost',
	    user: 'forumapp',
	    password: 'qwerty',
		database: 'myforum'
	})
// Connect to the database
db.connect(err =>
           {
			   if (err) throw err
	           console.log("Connected to database!")
           })
global.db = db

// Set the directory where static files (css, js, etc) will be
app.use(express.static(`${__dirname}/public`))

// Set the directory where Express will pick up HTML files
// __dirname will get the current directory
app.set("views", `${__dirname}/views`)

// Tell Express that we want to use Pug as the templating engine
app.set("view engine", "pug")

// Tells Express how we should process html files
// I want to use Pug's rendering engine
app.engine("html", pug.renderFile)

// Define our data
let forumData = {
	forumName: "I Couldn't Think of a Better Name for this Forum"
}

// Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file
require("./routes/main")(app, forumData)

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`))