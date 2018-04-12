'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL } = require('./config');

function dbConnect(url = DATABASE_URL) {
	return mongoose.connect(url)
		.catch(err => {
			console.error('Mongoose failed to connect');
			console.error(err);
		});
}

function dbDisconnect(url = DATABASE_URL) {
	return mongoose.disconnect(url);
}

function dbGet() {
	return mongoose;
}

module.exports = {
	dbConnect,
	dbDisconnect,
	dbGet
};