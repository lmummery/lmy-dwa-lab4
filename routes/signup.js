// Sign up route handler

module.exports = (app, forumData) =>
{
	// Handle sign up when accessed via the navbar - GET
	app.get("/signup", (req, res) =>
	{
		if (req.cookies.user) return res.redirect("./account")
		let initialVals = {
			username: "",
			password: "",
			firstname: "",
			surname: ""
		}
		return renderSignup(res, initialVals)
	})
	
	// Helper function to render the sign up page
	function renderSignup (res, vals, errorMsg = "")
	{
		let data = Object.assign({}, forumData, vals, {errormessage: errorMsg})
		res.render("signup", data)
		return
	}
	
	// Handle sign up after form submitted - POST
	app.post("/signup", (req, res) =>
	{
		// Check that a user does not already exist with this username
		let query = `select count(*) as countuser
					 from   myforum.users
					 where	username = "${req.body.username}"`
		db.query(query, (err, result) =>
		{
			if (err) return res.redirect("./")
			// Notify the user if that username is already taken
			if (result[0].countuser > 0) return renderSignup(res, req.body, "Username already taken!")
			
			// Check password length - it must be 8 <= length <= 32 characters
			if (req.body.password.length < 8 ||
			    req.body.password.length > 32) return renderSignup(res, req.body, "Password must be at 8-32 characters long")
			
			// Now that username and password have been validated, commit the new user to the database
			query = `insert into myforum.users (firstname, surname, username, password, country)
					 values (?, ?, ?, ?, ?)`
			let newrecord = [
				req.body.firstname, req.body.surname,
				req.body.username, req.body.password,
				req.body.country
			]
			db.query(query, newrecord, (err, result) =>
			{
				if (err) return renderSignup(res, req.body, "Something went wrong. Please try again shortly")
				
				// Assume everything went well and allow the user in
				res.cookie("user", req.body.username)
				res.redirect("./viewposts")
			})
		})
	})
}