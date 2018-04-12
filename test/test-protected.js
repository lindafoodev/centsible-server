/* eslint-env mocha */
'use strict';
global.TEST_DATABASE_URL = 'mongodb://Jc:Asdfasdf1@ds229549.mlab.com:29549/teamthree-test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const {TEST_DATABASE_URL, API_BASE_URL} = require('../config');
const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');
const {JWT_SECRET} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');
const expect = chai.expect;
const mongoose = require('mongoose');
// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Protected endpoint', function() {
	const username = 'exampleUser';
	const password = 'examplePass';
	const firstName = 'Example';
	const lastName = 'User';
	const email = 'JoeSchmo@gmail.com';
	const bday = '6/6/66';
 
	before(function() {
		console.log('runServer for tests');
		return dbConnect(TEST_DATABASE_URL);
	});
  
	after(function() {
		console.log('closing server after tests');
		// closeServer();
		return dbDisconnect(TEST_DATABASE_URL);
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
		return User.removeUser(username);
	});
	

	describe('/api/protected', function() {
		it('Should reject requests with no credentials', function() {
			return chai
				.request(app)
				.get('/api/protected')
				.then(res => {
					expect(res).to.have.status(401);
				})
				.catch(err => {
					if (err instanceof chai.AssertionError) {
						throw err;
					}
				});
		});

		it('Should reject requests with an invalid token', function() {
			const token = jwt.sign(
				{
					username,
					firstName,
					lastName,
					email,
					bday
				},
				'wrongSecret',
				{
					algorithm: 'HS256',
					expiresIn: '7d'
				}
			);

			return chai
				.request(app)
				.get('/api/protected')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					expect(res).to.have.status(401);
				})
				.catch(err => {
					if (err instanceof chai.AssertionError) {
						throw err;
					}
				});
		});
		it('Should reject requests with an expired token', function() {
			const token = jwt.sign(
				{
					user: {
						username,
						firstName,
						lastName,
						email,
						bday
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
				.get('/api/protected')
				.set('authorization', `Bearer ${token}`)
				.then(res => {
					expect(res).to.have.status(401);
				})
				.catch(err => {
					if (err instanceof chai.AssertionError) {
						throw err;
					}
				});
		});
		it('Should send protected data', function() {
			const token = jwt.sign(
				{
					user: {
						username,
						firstName,
						lastName,
						email,
						bday
					}
				},
				JWT_SECRET,
				{
					algorithm: 'HS256',
					subject: username,
					expiresIn: '7d'
				}
			);

			return chai
				.request(app)
				.get('/api/protected')
				.set('authorization', `Bearer ${token}`)
				.then(res => {
					expect(res).to.have.status(200);
					expect(res.body).to.be.an('object');
					expect(res.body.data).to.equal('rosebud');
				});
		});
	});
});
