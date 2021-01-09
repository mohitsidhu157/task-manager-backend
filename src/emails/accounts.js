const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (name, email) => {
	sgMail.send({
		to: email,
		from: "mk3051458@yopmail.com",
		subject: "Welcome to Task Manager",
		text: `Welcome to the app ${name}. Let me know how you get along with the app.`,

	})
}

const sendCancellationEmail = (name, email) => {
	sgMail.send({
		to: email,
		from: "mk3051458@yopmail.com",
		subject: "Reason for cancellation",
		text: `${name}, can you tell us what is the Reason for cancellation of your account?`
	})
}

module.exports = {
	sendWelcomeEmail,
	sendCancellationEmail
}
