const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(
	sendGridTransport({
		auth: {
			api: process.env.API_KEY
		}
	})
);

let sendSignUpEmail = (toEmail, code) => {
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD
		}
	});

	let mailOptions = {
		from: process.env.EMAIL,
		to: toEmail,
		subject: 'Verification code',
		html:
			'<div style="width:75%; margin:auto;">' +
			'<h3>Thank you for signing up.</h3>' +
			`<p>Your confirmation code is: <b>${code}</b></p>` +
			'</div>'
	};
	transporter.sendMail(mailOptions).then((res) => console.log(res)).catch((error) => console.log(error));
};

module.exports = sendSignUpEmail;
