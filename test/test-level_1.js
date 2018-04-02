/* eslint-env mocha */
'use strict';
const {dbConnect, dbDisconnect} = require('../db-mongoose');
const {TEST_DATABASE_URL} = require('../config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const {JWT_SECRET} = require('../config');
const jwt = require('jsonwebtoken');
const { app } = require('../server');
const { User } = require('../users');
const passportStub = require('passport-stub');

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);
passportStub.install(app);

describe('/api/risk/invest', function() {
	const username = 'exampleUser';
	const password = 'examplePass';
	const lastName = 'User';
	const firstName = 'Example';
	const email = 'JoeSchmo@gmail.com';
	const bday = '2/2/82';
	const risk = 'high';
	const year = '1';
	const currentFund = 5200;
	let id = 0;

 
	const token = jwt.sign({
		user: {
			username, 
			firstName,
			lastName,
			email,
			bday
		}
	},
	'chachaslide',
	{
		algorithm: 'HS256',
		subject: username,
		expiresIn: '7d'
	}
	);
  
	before(function() {
		console.log('runServer for tests');
		return dbConnect(TEST_DATABASE_URL);
	});
  
	after(function() {
		console.log('closing server after tests');
		return dbDisconnect();
	});

	beforeEach(function() {
		console.log('BeforeEach');
		return User.hashPassword(password)
			.then(hash =>
				User.create({
					username,
					password: hash,
					firstName,
					lastName,
					bday,
					email
				})
					.then( () => {
						return chai
							.request(app)
							.post('/api/auth/login')
							.set('authorization', `Bearer ${token}`)
							.send({
								username: username, 
								password: password
							})
							.then( () => {
								return chai
									.request(app)
									.put('/api/risk/invest')
									.set('authorization', `Bearer ${token} `)
									.send({
										risk,
										year,
										currentFund
									})
									.then(usr => {
										id = usr._id;
									});
							});
					})
			);
	});


	afterEach(function () {
		return User.remove({});
	});
	

	describe('/api/risk/invest', function() {
		describe('PUT', function() {
			// it('Should send back User data from protected endpoint', function () {
			// 	console.log('user id = ', id);
			// 	return chai
			// 		.request(app)
			// 		.put('/api/risk/invest')
			// 		.set('authorization', `Bearer ${token} `)
			// 		.send({
			// 			risk,
			// 			year,
			// 			currentFund,
			// 			id
			// 		})
			// 		.then(res => {
			// 			expect(res).to.be.status(204);
			// 			expect(res.body).to.be.an('object');
			// 			expect(res.body.risk).to.equal(risk);
			// 			expect(res.body.year).to.equal(year);
			// 		});
			// });
			// it('Should reject for missing field in body', function() {
			// 	const token = jwt.sign(
			// 		{
			// 			username,
			// 			firstName,
			// 			lastName,
			// 			email,
			// 			bday
			// 		},
			// 		JWT_SECRET,
			// 		{
			// 			algorithm: 'HS256',
			// 			subject: username,
			// 			expiresIn: '7d'
			// 		}
			// 	);
			// 	return chai
			// 		.request(app)
			// 		.put('/api/risk/invest')
			// 		.set('Authorization', `Bearer ${token}`)
			// 		.send({
			// 			risk,
			// 			currentFund
			// 		})
			// 		.then(() =>
			// 			expect.fail(null, null, 'Request should not succeed')
			// 		)
			// 		.catch(err => {
			// 			if (err instanceof chai.AssertionError) {
			// 				throw err;
			// 			}
			// 			const res = err.response;
			// 			expect(res).to.have.status(422);
			// 			expect(res.body.reason).to.equal('ValidationError');
			// 			expect(res.body.message).to.equal('Missing field');
			// 			expect(res.body.location).to.equal('year');
			// 		});
			// });
			// it('Should update and return the User object', function () {
			// 	return chai
			// 		.request(app)
			// 		.put('/api/risk/invest')
			// 		.send({
			// 			risk,
			// 			year,
			// 			currentFund
			// 		})
			// 		.then( res => {
			// 			expect(res).to.have.status(201);
			// 			expect(res.body).to.be.an('object');
			// 			expect(res.body).to.have.keys(
			// 				'username',
			// 				'email',
			// 				'bday',
			// 				'risk',
			// 				'currentFund',
			// 				'initialFund',
			// 				'previousFund',
			// 				'level',
			// 				'lastName',
			// 				'firstName'
			// 			);
			// 		});
			// });
		});
	});
});