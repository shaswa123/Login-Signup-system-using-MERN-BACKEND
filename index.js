const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const filter = require('content-filter');
const cors = require('cors');
const sanitizer = require('mongo-sanitize');

const PORT = process.env.PORT || 5000;

const mongoConnect = require('./database');
const sendSignUpEmail = require('./email');

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(filter());
app.use(cors());

app.post('/signup', (req, res) => {
	let dbPass = mongoConnect((db) => {
		db = db.db();
		// CHECK if user exists in DB
		db
			.collection('login_users')
			.findOne({ email: sanitizer(req.body.email) })
			.then((result) => {
				if (result != null) {
					// IF user found then send 409 --> Duplicate entry
					res.send(
						JSON.stringify({
							message: 409
						})
					);
				} else {
					// IF user does not exist then insert into DB
					bcrypt
						.hash(req.body.password, 12)
						.then((hashedPass) => {
							db
								.collection('login_users')
								.insertOne({
									name: sanitizer(req.body.name),
									email: sanitizer(req.body.email),
									password: sanitizer(hashedPass)
								})
								.then((result) => {
									// SEND EMAIL
									let code = String(Math.random() * Math.random() * 100);
									bcrypt
										.hash(code, 12)
										.then((h) => {
											sendSignUpEmail(req.body.email, code);
											res.send({
												message: 200
											});
										})
										.catch((error) => console.log(error));
								})
								.catch((error) => {
									console.log(error);
								});
						})
						.catch((error) => console.log(error));
				}
			})
			.catch((error) => {
				console.log(error);
			});
	});
});

app.post('/', (req, res) => {
	let dbPass = mongoConnect((db) => {
		bcrypt
			.hash(req.body.password, 12)
			.then((hashedPass) => {
				db = db.db();
				db
					.collection('login_users')
					.findOne({ email: sanitizer(req.body.email), password: sanitizer(hashedPass) })
					.then((result) => {
						if (result !== null) {
							res.send(
								JSON.stringify({
									message: 200,
									id: result['_id']
								})
							);
						} else {
							res.send(
								JSON.stringify({
									message: 404
								})
							);
						}
					})
					.catch((err) => console.log(err));
			})
			.catch((error) => console.log(error));
	});
});

app.get((req, res) => {
	res.status(404).send('404');
});

mongoConnect((db) => {
	app.listen(PORT, () => {
		console.log(`Listening on: http://localhost:${PORT}`);
	});
});
