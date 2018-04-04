'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const RiskSchema = mongoose.Schema ({
	year: String,
	gain: Number,
	risk: String,
	yearEndBalance: Number,
	amtChange: Number,
});

RiskSchema.methods.serialize = function() {
	return {
		year: this.year,
		gain: this.gain,
		risk: this.risk,
		yearEndBalance: this.yearEndBalance,
		amtChange: this.amtChange,

	};
};

const Risk = mongoose.model('Risk', RiskSchema);

module.exports = {Risk};