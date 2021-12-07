// Login and Account route handlers

module.exports = (app, forumData) =>
{
	// Login page
	app.get("/login", (req, res) =>
	{
		if (req.cookies.user) return res.redirect("./account")
		
		let initialVals = {username: ""}
		return renderLogin(res, initialVals)
	})
	
	// Helper function to render login page
	function renderLogin (res, vals, errorMsg = "")
	{
		let data = Object.assign({}, forumData, vals, {
			errormessage: errorMsg
		})
		
		res.render("login", data)
	}
	
	// Account page - GET - called when already logged in (through navbar)
	app.get("/account", (req, res) =>
	{
		res.clearCookie("lastSearch")
		
		if (!req.cookies.user) return res.redirect("./login")
		
		// Set up query - username is not a primary key but *is* unique
		let query = `select *
					 from   myforum.users
					 where  username = "${req.cookies.user}"`
		db.query(query, (err, result) =>
		{
			if (err) res.redirect("./")
			
			if (result[0] === undefined) return res.redirect("./")
			
			// Redirect to user page for the currently logged in user
			res.redirect(`./user?user=${result[0].user_id}`)
		})
	})
	
	// Account page - POST - called when logging in
	app.post("/account", (req, res) =>
	{
		let query = `select *
					 from   myforum.users
					 where  username = "${req.body.username}"`
		
		// Make sure the user exists
		db.query(query, (err, result) =>
		{
			if (err) res.redirect("./login")
			// If no such user exists
			if (result[0] === undefined) return res.redirect("./login")
			
			if (result[0].password !== req.body.password) return renderLogin(res, req.body, "Incorrect password")
			
			let data = Object.assign({}, forumData, {user: result[0]})
			res.cookie("user", data.user.username)
			res.redirect(`./user?user=${data.user.user_id}`)
		})
	})
}