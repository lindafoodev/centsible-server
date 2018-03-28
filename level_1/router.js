'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const {Risk} = require('./models');
const {User} = require('../users/models');

const router = express.Router();
router.use(bodyParser.json());

function _calcPercentIncrease( _fundVal, _risk, _year ) {
	console.log('Enter calcPercentIncrease ', _fundVal, _risk, _year);
	
	let riskVal;
	Risk
		.find({
			'risk': {'$in': [_risk]},
			'year': {'$in': [_year]}
		}) 
		.then(risk => {
			console.log('risk = ', risk[0].gain);
			riskVal = risk[0].gain;                              
			return _fundVal + ((riskVal/100) * _fundVal);
		});
}
router.put('/:id', (req, res) => { 
	console.log('enter put /risk', req.body);
  
	const requiredFields = ['risk','year'];
	for ( let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];
		console.log(field);
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			return res.status(400).send(message);
		}
	}
  
	let {risk, year} = req.body;
	let newFundAmt;

	User.findById(req.params.id)
		.then(game => {
			console.log('_game = ', game);
	    newFundAmt = _calcPercentIncrease(game.game.currentFund, risk, year);
			console.log('newFundAmt = ', newFundAmt);
			let toUpdate = [];
			toUpdate[year] = {x: year, y: newFundAmt};
			console.log('toUpdate = ', toUpdate);
		});
	.findByIdAndUpdate(req.params.id, {$set: toUpdate})
	.then(level => {
		return res.status(201).json(level.serialize());
	})
	.catch(err => {
		return res.status(err.code).json(err);
	});
  
});
//send back risk array [{x: year, y: currentFund}]
//and currentFund value and percent change for year/risk level
//change risk object to [{x: year, y: currentFund}]

router.get('/:risk', (req, res) => {
	console.log('enter get /risk', req.params.risk);
	//get risk level values and return
	return Risk.find({}).where('risk').equals(req.params.risk)
		.then(values => res.json(values))
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router};