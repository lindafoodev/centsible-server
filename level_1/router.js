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

//endpoint takes in risk, year, and currentFund
//and updates the User database with a new currentFund,
//initialFund and previousFund
//sends back the User object to the client
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
			'x': {'$in': [year]}
		}) 
		.then(riskData => {
			console.log('find from riskData Db = ', riskData[0].gain);
			let growth = riskData[0].gain;
			newFundAmt = currentFund + (Math.floor(((riskData[0].gain/100) * currentFund)));
			prevFundAmt = currentFund;
	    return User
				.findByIdAndUpdate(req.user.id, {
					$set:{ 'currentFund': newFundAmt, 'previousFund': prevFundAmt, 'year': year },
					$push:{ 'risk': { 'x': year, 'y': newFundAmt, 'strategy': risk, 'previousYear': prevFundAmt, 'growth': growth}}
				}, {new: true} )
				.then(data => {
					console.log('user data being sent back ', data);
					return res.status(200).json(data.serialize());
				})
				.catch(err => {
					return res.status(500).json(err);
				});
		})
		.catch(err => {
			return res.status(500).json(err);
		});
});

router.get('/market/:strat', (req, res) => {
	console.log('Enter the market/optimal endpoint');
	return Risk.find({'risk': {'$in': [req.params.strat]}})
		.then(values => {
			const newArr = [{x:0,y:5000},...values];
			console.log('risk values = ', values);
			return res.json(newArr);
		})
		.catch(err => res.status(500).json(err,{message: 'Internal server error'}));

});




//route which takes in the year
//and passes the risk strategies gain values for that year
router.get('/invest/:year', jwtAuth, (req, res) => {
	console.log('Enter the GET /invest/:year endpoint year = ', req.params.year);
	return Risk
		.find({
			'x' : {'$in': [req.params.year]}
		})
		.then(data => {
			console.log('data back from risk.find ', data);
			return res.json(data);
		})
		.catch(err => {
			return res.status(500).json(err);
		});
});


//endpoint to check that the Risk database has data in it
//not used by the client
router.get('/:risk', jwtAuth, (req, res) => {
	console.log('enter get /risk', req.params.risk);
	//get risk level values and return
	return Risk.find({}).where('risk').equals(req.params.risk)
		.then(values => res.json(values))
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});


//endpoint which will return all the Risk data
router.get('/market/all', jwtAuth, (req, res) => {
	console.log('Enter the market/all endpoint');
	return Risk.find({})
		.then(values => {
			console.log('risk values = ', values);
			return res.json(values);
		})
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/market/:strat', jwtAuth, (req, res) => {
	console.log('Enter the market/optimal endpoint');
	return Risk.find({'risk': {'$in': [req.params.strat]}})
		.then(values => {
			const newArr = [{x:0,y:5000},...values];
			console.log('risk values = ', values);
			return res.json(newArr);
		})
		.catch(err => res.status(500).json(err,{message: 'Internal server error'}));
});

module.exports = {router};