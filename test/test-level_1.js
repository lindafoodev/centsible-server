'use strict';
global.DATABASE_URL = 'mongodb://localhost/jwt-auth-demo-test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);


describe('/api/risk', function() {
    const initialFund = 5000;
    const currentFund = 6200;
    const previousFund = 5600;
    const year = 1;
    const risk = 'high';
    const username = 'exampleUser';
    const password = 'examplePass';
    const lastName = 'User';
    const firstName = 'Example';
    const email = 'JoeSchmo@gmail.com';
    const bday = '2/2/82';


    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    beforeEach(function() {
        return;
        User.create({
            username,
            password,
            firstName,
            lastName,
            bday,
            email
        });
    });

    afterEach(function() {
        return User.remove({});
    });

    describe('/api/risk', function() {
        describe('POST', function() {
            it('Should check for required fields in body', function() {
                return chai
                    .request(app)
                    .post('/api/risk')
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
            // it('Should update and return the User object', function () {
            // 	return chai
            // 		.request(app)
            // 		.post('/api/risk')
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