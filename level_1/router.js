'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const {Risk} = require('./models');
const {User} = require('../users/models');
const { localStrategy, jwtStrategy } = require('../auth/strategies');
const router = express.Router();
router.use(bodyParser.json());

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.put('/invest', jwtAuth, (req, res) => { 
	console.log('enter the post api/risk/invest ', req.user.id);
	//validate the fields in the body
	const requiredFields = ['risk','year','currentFund'];
	const missingField = requiredFields.find(field => !(field in req.body));

	if (missingField) {
		console.log('missing field = ', missingField);
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Missing field',
			location: missingField
		});
    
	}
  
	let {risk, year, currentFund} = req.body;
	let newFundAmt;
	let prevFundAmt;
  
	//get the % increase/decrease from the Risk Db. This value
	//is determined by the year and risk level
	return Risk
		.find({
			'risk': {'$in': [risk]},
			'year': {'$in': [year]}
		}) 
		.then(risk => {
			console.log('find from Risk Db = ', risk[0].gain);
			newFundAmt = currentFund + (Math.floor(((risk[0].gain/100) * currentFund)));
			prevFundAmt = currentFund;
	    return User
				.findByIdAndUpdate(req.user.id, {
					$set:{ 'currentFund': newFundAmt, 'previousFund': prevFundAmt, 'year': year },
					$push:{ 'risk': { 'x': year, 'y': newFundAmt }}
				}, {new: true} )
				.then(data => {
					console.log('user data being sent back ', data);
					return res.status(204).json(data.serialize());
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