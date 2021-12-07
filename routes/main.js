// Route handler for forum web app

module.exports = (app, forumData) =>
{
	// Home page
	app.get("/", (req, res) =>
	{
		res.clearCookie("lastSearch")
		
		res.render("index", forumData)
	})
	
	// About page
	app.get("/about", (req, res) =>
	{
		res.clearCookie("lastSearch")
		
		res.render("about", forumData)
	})
	
	// View Posts page
	app.get("/viewposts", (req, res) =>
	{
		res.clearCookie("lastSearch")
		
		let query,
		    pageTitle,
		    filtered = true
		if (req.query.topic)
		{
			// Query to select all posts in chosen topic
			query = `select     *
					 from       myforum.view_posts
					 where      topic_title = "${req.query.topic}"`
			pageTitle = `Posts in ${req.query.topic}`
		}
		else if (req.query.user)
		{
			// Query to select all posts by chosen user
			query = `select     *
					 from       myforum.view_posts
					 where      username = "${req.query.user}"`
			pageTitle = `Posts by ${req.query.user}`
		}
		else
		{
			// Query to select all posts from the database
			query = `select     *
					 from       myforum.view_posts`
			pageTitle = "View All Posts"
			filtered = false
		}
		
		// Run the query
		db.query(query, (err, results) =>
		{
			if (err) res.redirect("./")
			
			// Pass results into pug template and render it
			let data = Object.assign({}, forumData, {
				posts: results,
				pageTitle: pageTitle,
				filtered: filtered
			})
			res.render("viewposts", data)
		})
	})
	
	// List Users page
	app.get("/users", (req, res) =>
	{
		res.clearCookie("lastSearch")
		
		// Query to select all users
		let query = `select 	*
					 from   	myforum.users
					 order by	username`
		
		// Run the query
		db.query(query, (err, results) =>
		{
			if (err) res.redirect("./")
			
			// Pass results into pug template and render it
			let data = Object.assign({}, forumData, {users: results})
			res.render("users", data)
		})
	})
	
	// List Topics page
	app.get("/topics", (req, res) =>
	{
		res.clearCookie("lastSearch")
		
		// Query to select all topics
		let query = `select     topic_id, topic_title, topic_description
					 from   	myforum.topics
					 order by	topic_title`
		
		// Run the query
		db.query(query, (err, results) =>
		{
			if (err) res.redirect("./")
			
			// Pass results to pug template and render it
			let data = Object.assign({}, forumData, {topics: results})
			res.render("topics", data)
		})
	})
	
	// Add New Post page
	app.get("/addpost", (req, res) =>
	{
		res.clearCookie("lastSearch")
		
		// Set initial values for the form
		let initialVals = {
			username: req.cookies.user ? req.cookies.user : "",
			editable: !!req.cookies.user,
			topic: "",
			title: "",
			content: ""
		}
		
		return renderAddNewPost(res, initialVals)
	})
	
	// Helper function to render the add new post page
	function renderAddNewPost (res, vals, errorMsg = "")
	{
		let data = Object.assign({}, forumData, vals, {errormessage: errorMsg})
		res.render("addpost", data)
		return
	}
	
	// Add New Post form handler
	app.post("/postadded", (req, res) =>
	{
		let formVals = [
			req.body.title, req.body.content, req.body.topic, req.body.username
		],
		    query = "call insert_post(?, ?, ?, ?)"
		db.query(query, formVals, (err, result) =>
		{
			if (err) return renderAddNewPost(res, req.body, err.message)
			
			// res.send("Your post has been added to the forum")
			res.redirect("./viewposts")
		})
	})
	
	// Search for Posts page
	app.get("/search", (req, res) =>
	{
		let data = Object.assign({}, forumData, {
			lastSearch: req.cookies.lastSearch ? req.cookies.lastSearch : ""
		})
		res.render("search", data)
	})
	
	// Search for Posts form handler
	app.get("/search-result", (req, res) =>
	{
		res.cookie("lastSearch", req.query.keyword)
		let term = `%${req.query.keyword}%`,
		    query = `select *
		             from   myforum.view_posts
		             where	post_title like ? or post_content like ? or username like ?`
		db.query(query, [term, term, term], (err, results) =>
		{
			if (err) res.redirect("./")
			
			let data = Object.assign({}, forumData, {
				posts: results,
				pageTitle: `Results for ${req.query.keyword}`
			})
			res.render("viewposts", data)
		})
	})
	
	// User page
	app.get("/user", (req, res) =>
	{
		res.clearCookie("lastSearch")
		
		let query = `select *
					 from	myforum.users
					 where	user_id = ${req.query.user}`
		db.query(query, (err, result) =>
		{
			// console.log(result)
			if (err) res.send("An error has occurred")
			let userData = Object.assign({}, forumData, {
				user: result[0],
				loggedin: result[0].username == req.cookies.user
			})
			
			query = `select *
					 from   myforum.posts p
					 join	myforum.topics t
					 on		t.topic_id = p.topic_id
					 where	p.user_id = ${req.query.user}`
			
			db.query(query, (err, results) =>
			{
				if (err) res.redirect("./users")
				
				let data = Object.assign({}, userData, {posts: results})
				
				query = `select m.*, t.topic_title
						 from   myforum.membership m
						 join   myforum.topics t
						 on     t.topic_id = m.topic_id
						 where  user_id = ${req.query.user}`
				
				db.query(query, (err, results) =>
				{
					if (err) res.redirect("./users")
					
					data = Object.assign({}, data, {memberships: results})
					res.render("user", data)
				})
			})
		})
	})
	
	// Post page
	app.get("/post", (req, res) =>
	{
		res.clearCookie("lastSearch")
		
		let query = `select *
					 from   myforum.view_posts
					 where	post_id = ${req.query.id}`
		db.query(query, (err, result) =>
		{
			if (err) res.redirect("./viewposts")
			
			// console.log(result)
			let data = Object.assign({}, forumData, {
				post: result[0],
				ownpost: req.cookies.user === result[0].username // Used to allow only the owner of the post to delete it
			})
			res.render("post", data)
		})
	})
	
	// Topic page
	app.get("/topic", (req, res) =>
	{
		res.clearCookie("lastSearch")
		
		let query = `select topic_title, topic_description
					 from   myforum.topics
					 where	topic_id = ${req.query.id}`
		db.query(query, (err, result) =>
		{
			if (err) res.redirect("./topics")
			
			let data = Object.assign({}, forumData, result[0])
			// res.send(data)
			
			query = `select *
					 from   myforum.view_posts
					 where	topic_id = ${req.query.id}
					 order by post_date desc`
			
			db.query(query, (err, results) =>
			{
				if (err) res.redirect("./topics")
				
				// res.send(results)
				data = Object.assign({}, data, {posts: results})
				
				// Find the members of this topic
				query = `select u.user_id, u.username
						 from   myforum.membership m
						 join	myforum.users u on u.user_id = m.user_id
						 where	m.topic_id = ${req.query.id}`
				
				db.query(query, (err, results) =>
				{
					if (err) return res.redirect("./topics")
					
					data = Object.assign({}, data, {members: results})
					res.render("topic", data)
				})
			})
		})
	})
	
	// Account handling moved to external file
	require("./account")(app, forumData)
	
	// Sign up handling moved to external file
	require("./signup")(app, forumData)
	
	// Logout route
	app.get("/logout", (req, res) =>
	{
		// Clear the user cookie and redirect to the index page
		res.clearCookie("user")
		res.clearCookie("lastSearch")
		res.redirect("./")
	})
	
	// Handler for deleting a post
	app.get("/delete", (req, res) =>
	{
		// Prepare record for deletion
		let query = `delete
					 from   myforum.posts
					 where  post_id = ${req.query.id}`
		
		// Run the delete query
		db.query(query, (err, result) =>
		{
			if (err) return res.redirect("./viewposts")
			
			res.redirect("./viewposts")
		})
	})
}