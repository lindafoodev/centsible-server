/* eslint-env mocha */
'use strict';
const {dbConnect, dbDisconnect} = require('../db-mongoose');
const {TEST_DATABASE_URL} = require('../config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const {JWT_SECRET} = require('../config');
const jwt = require('jsonwebtoken');
const { app, closeServer } = require('../server');
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
	const year = 1;
	const currentFund = 5200;
	let receivedToken;
 
  
	before(function() {
		console.log('runServer for tests');
		return dbConnect(TEST_DATABASE_URL);
	});
  
	after(function() {
		console.log('closing server after tests');
		closeServer();
		return dbDisconnect();
	});
	//create a user, login the user, get the token, which is required for the protected endpoint tests
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
							.send({
								username: username, 
								password: password
							})
							.then(res => {
								expect(res).to.have.status(200);
								receivedToken = res.body.authToken;
							})
							.catch(err => {
								if (err instanceof chai.AssertionError)
									throw err;
							});
					})
			);
	});


	afterEach(function () {
		return User.remove({});
	});
	

	describe('/api/risk/invest', function() {
		describe('PUT', function() {
			it('Should update and return User data', function () {
				return chai
					.request(app)
					.put('/api/risk/invest')
					.set('authorization', `Bearer ${receivedToken} `)
					.send({
						risk,
						year,
						currentFund,
					})
					.then(res => {
						expect(res).to.be.status(200);
						expect(res.body).to.be.an('object');
						expect(res.body.username).to.equal(username);
						expect(res.body.risk[0].strategy).to.equal(risk);
						expect(res.body.year).to.equal(year);
					});
			});
			it('Should reject for missing field in body', function() {
				return chai
					.request(app)
					.put('/api/risk/invest')
					.set('Authorization', `Bearer ${receivedToken}`)
					.send({
						risk,
						currentFund
					})
					.then(() =>
						expect.fail(null, null, 'Request should not succeed')
					)
					.catch(err => {
						if (err instanceof chai.AssertionError) {
							throw err;
						}
						const res = err.response;
						expect(res).to.have.status(422);
						expect(res.body.reason).to.equal('ValidationError');
						expect(res.body.message).to.equal('Missing field');
						expect(res.body.location).to.equal('year');
					});
			});
			it('Should return all the strategies by year', function () {
				return chai
					.request(app)
					.get('/api/risk/invest/' + year)
					.set('Authorization', `Bearer ${receivedToken}`)
					.send({
						year,
					})
					.then( res => {
						expect(res).to.have.status(200);
						expect(res.body).to.be.an('array');
					});
			});
		});
	});
});