/* eslint-env mocha */
'use strict';
const {dbConnect, dbDisconnect} = require('../db-mongoose');
const {TEST_DATABASE_URL} = require('../config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { JWT_SECRET } = require('../config');

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Auth endpoints', function () {
	const username = 'exampleUser';
	const password = 'examplePass';
	const firstName = 'Example';
	const lastName = 'User';
	const email = 'hahaha@yahoo.com';
	const bday = '2003-03-13T04:00:00.000Z';
	const initialFund = 5000;
	const currentFund = 5000;
	const level = 1;
	const risk = [];

	before(function() {
		console.log('runServer for tests');
		return dbConnect(TEST_DATABASE_URL);
	});
  
	after(function() {
		console.log('closing server after tests');
		 closeServer();
		return dbDisconnect();
	});

	beforeEach(function() {
		return User.hashPassword(password).then(password =>
			User.create({
				username,
				password,
				firstName,
				lastName,
				bday,
				email
			})
		);
	});

	afterEach(function () {
		return User.remove({});
	});

	describe('/api/auth/login', function () {
		it('Should reject requests with no credentials', function () {
			return chai
				.request(app)
				.post('/api/auth/login')
				.then(() =>
					expect.fail(null, null, 'Request should not succeed')
				)
				.catch(err => {
					if (err instanceof chai.AssertionError) {
						throw err;
					}

					const res = err.response;
					expect(res).to.have.status(400).done();
				});
		});
		it('Should reject requests with incorrect usernames', function () {
			return chai
				.request(app)
				.post('/api/auth/login')
				.send({ username: 'wrongUsername', password })        
				.then(() =>
					expect.fail(null, null, 'Request should not succeed')
				)
				.catch(err => {
					if (err instanceof chai.AssertionError) {
						throw err;
					}

					const res = err.response;
					expect(res).to.have.status(401).done();
				});
		});
		it('Should reject requests with incorrect passwords', function () {
			return chai
				.request(app)
				.post('/api/auth/login')
				.send({ username, password: 'wrongPassword' })
				.then(() =>
					expect.fail(null, null, 'Request should not succeed')
				)
				.catch(err => {
					if (err instanceof chai.AssertionError) {
						throw err;
					}

					const res = err.response;
					expect(res).to.have.status(401).done();
				});
		});
		it('Should return a valid auth token', function () {
			return chai
				.request(app)
				.post('/api/auth/login')
				.send({ username, password })
				.then(res => {
					expect(res).to.have.status(200);
					expect(res.body).to.be.an('object');
					const token = res.body.authToken;
					expect(token).to.be.a('string');
					const payload = jwt.verify(token, JWT_SECRET, {
						algorithm: ['HS256']
					});
					const decoded = jwt.decode(token);
					expect(payload.exp).to.be.at.least(decoded.exp).done();
				});
		});
	});

	describe('/api/auth/refresh', function () {
		it('Should reject requests with no credentials', function () {
			return chai
				.request(app)
				.post('/api/auth/refresh')
				.then(() =>
					expect.fail(null, null, 'Request should not succeed')
				)
				.catch(err => {
					if (err instanceof chai.AssertionError) {
						throw err;
					}

					const res = err.response;
					expect(res).to.have.status(401).done();
				});
		});
		it('Should reject requests with an invalid token', function () {
			const token = jwt.sign(
				{
					username,
					firstName,
					lastName
				},
				'wrongSecret',
				{
					algorithm: 'HS256',
					expiresIn: '7d'
				}
			);

			return chai
				.request(app)
				.post('/api/auth/refresh')
				.set('Authorization', `Bearer ${token}`)
				.then(() =>
					expect.fail(null, null, 'Request should not succeed')
				)
				.catch(err => {
					if (err instanceof chai.AssertionError) {
						throw err;
					}

					const res = err.response;
					expect(res).to.have.status(401).done();
				});
		});
		it('Should reject requests with an expired token', function () {
			const token = jwt.sign(
				{
					user: {
						username,
						firstName,
						lastName
					},
					exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
				},
				JWT_SECRET,
				{
					algorithm: 'HS256',
					subject: username
				}
			);

			return chai
				.request(app)
				.post('/api/auth/refresh')
				.set('authorization', `Bearer ${token}`)
				.then(() =>
					expect.fail(null, null, 'Request should not succeed')
				)
				.catch(err => {
					if (err instanceof chai.AssertionError) {
						throw err;
					}

					const res = err.response;
					expect(res).to.have.status(401).done();
				});
		});
		it('Should return a valid auth token with a newer expiry date', function () {
			const token = jwt.sign(
				{
					user: {
						username,
						firstName,
						lastName,
						email,
						bday,
						level,
						initialFund,
						currentFund,
			      risk 
					}
				},
				JWT_SECRET,
				{
					algorithm: 'HS256',
					subject: username,
					expiresIn: '7d'
				}
			);
			const decoded = jwt.decode(token);

			return chai
				.request(app)
				.post('/api/auth/refresh')
				.set('authorization', `Bearer ${token}`)
				.then(res => {
					expect(res).to.have.status(200);
					expect(res.body).to.be.an('object');
					const token = res.body.authToken;
					expect(token).to.be.a('string');
					const payload = jwt.verify(token, JWT_SECRET, {
						algorithm: ['HS256']
					});
					expect(payload.user).to.deep.equal({
						username,
						firstName,
						lastName,
						email,
						bday,
						level,
						initialFund,
						currentFund,
						risk
					});
					expect(payload.exp).to.be.at.least(decoded.exp).done();
				});
		});
	});
});
