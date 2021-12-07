let cookies = document.cookie.split("; ")
// console.log(cookies)
let userCookie = null
cookies.forEach(el =>
                {
					let es = el.split("=")
					if (es[0] === "user") userCookie = es[1]
                })

// console.log(`user: ${userCookie}`)

if (userCookie === null)
{
	let els = Array.from(document.getElementsByClassName("loggedinonly"))
	els.forEach(e => e.remove())
}
else
{
	let els = Array.from(document.getElementsByClassName("loggedoutonly"))
	els.forEach(e => e.remove())
}