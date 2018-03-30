'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const {Risk} = require('./models');
const {User} = require('../users/models');

const router = express.Router();
router.use(bodyParser.json());

router.put('/', (req, res) => { 
	console.log('Enter the PUT', req.body, req.user._id);
  
	//validate the fields in the body
	const requiredFields = ['risk','year','currentFund'];
	const missingField = requiredFields.find(field => !(field in req.body));

	if (missingField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Missing field',
			location: missingField
		});
	}
  
	let {risk, year, currentFund} = req.body;
	let newFundAmt;
  
	//get the % increase/decrease from the Risk Db. This value
	//is determined by the year and risk level
	return Risk
		.find({
			'risk': {'$in': [risk]},
			'year': {'$in': [year]}
		}) 
		.then(risk => {
			newFundAmt = currentFund + (Math.floor(((risk[0].gain/100) * currentFund)));
			console.log('newFundAmt = ', newFundAmt);
	    return User
				.findByIdAndUpdate(req.user._id, {
					$set:{ 'currentFund': newFundAmt, 'year': year },
					$push:{ 'risk': { 'x': year, 'y': newFundAmt }}
				}, {new: true} )
				.then(res => {
					console.log('response = ', res);
					return res.status(204).json(res.serialize());
				})
				.catch(err => {
					return res.status(500).json(err);
				});
		})
		.catch(err => {
			return res.status(500).json(err);
		});
});

router.get('/:risk', (req, res) => {
	console.log('enter get /risk', req.params.risk);
	//get risk level values and return
	return Risk.find({}).where('risk').equals(req.params.risk)
		.then(values => res.json(values))
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router};