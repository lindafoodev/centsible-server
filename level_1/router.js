'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const {Risk} = require('./models');
const {User} = require('../users/models');

const router = express.Router();
router.use(bodyParser.json());

router.put('/:id', (req, res) => { 
	console.log('Enter the PUT', req.body, req.params.id);
  
	//validate the fields in the body
	const requiredFields = ['risk','year','currentFund'];
	for ( let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			return res.status(400).send(message);
		}
	}
  
	let {risk, year, currentFund} = req.body;
	let newFundAmt;
  
	//get the % increase/decrease from the Risk Db. This value
	//is determined by the year and risk level
	Risk
		.find({
			'risk': {'$in': [risk]},
			'year': {'$in': [year]}
		}) 
		.then(risk => {
			newFundAmt = currentFund + (Math.floor(((risk[0].gain/100) * currentFund)));
			console.log('newFundAmt = ', newFundAmt);
		}) 
		.catch(err => {
			return res.status(500).json(err);
		});

	User
		.findByIdAndUpdate(req.params.id, {
			$set:{ 'currentFund': newFundAmt },
			$push:{ 'risk': { 'x': year, 'y': newFundAmt } }
		})
		.then(res => {
			console.log('response = ', res);
			return res.status(204).json(res.serialize());
		})
		.catch(err => {
			return res.status(500).json(err);
		});

	// update the User Db with new currentFund amount and risk by year array
	// User
	// 	.findByIdAndUpdate(req.params.id, {$set: {'currentFund': newFundAmt}
	// 	})
	// 	.then(res => {
	// 		console.log('response = ', res);
	// 		return res.status(204).json(res.serialize());
	// 	})
	// 	.catch(err => {
	// 		return res.status(500).json(err);
	// 	});
});

router.get('/:risk', (req, res) => {
	console.log('enter get /risk', req.params.risk);
	//get risk level values and return
	return Risk.find({}).where('risk').equals(req.params.risk)
		.then(values => res.json(values))
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router};