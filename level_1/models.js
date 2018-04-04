'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const RiskSchema = mongoose.Schema ({
	year: String,
	gain: String,
	risk: String 
});

RiskSchema.methods.serialize = function() {
	return {
		year: this.year,
		gain: this.gain,
		risk: this.risk,
	};
};

const Risk = mongoose.model('Risk', RiskSchema);

module.exports = {Risk};