'use strict';

exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000',
exports.DATABASE_URL = process.env.DATABASE_URL ||'mongodb://localhost/thinkful-backend',
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://Jc:Asdfasdf1@ds229549.mlab.com:29549/teamthree-test';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = 'chachaslide';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
