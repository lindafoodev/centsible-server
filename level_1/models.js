'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const RiskSchema = mongoose.Schema ({
	x: String,
	gain: Number,
	risk: String,
	y: Number,
	amtChange: Number,
});

RiskSchema.methods.serialize = function() {
	return {
		x: this.x,
		gain: this.gain,
		risk: this.risk,
		y: this.y,
		amtChange: this.amtChange,

	};
};

const Risk = mongoose.model('Risk', RiskSchema);

module.exports = {Risk};