'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const {Risk} = require('./models');
const {User} = require('../users/models');

const router = express.Router();
router.use(bodyParser.json());

router.post('/', (req, res) => { 
	console.log('enter post /risk', req.body);
  
	// const requiredFields = ['game','level', 'initialFund', 'currentFund', 'risk', '1','year'];
	// for ( let i = 0; i < requiredFields.length; i++) {
	// 	const field = requiredFields[i];
	// 	console.log(field);
	// 	if (!(field in req.body)) {
	// 		const message = `Missing \`${field}\` in request body`;
	// 		return res.status(400).send(message);
	// 	}
	// }
	let { level, initialFund, currentFund, risk, year} = req.body;
	return User.create({
		game: {
			level: level,
			initialFund: initialFund,
			currentFund: currentFund,
			risk: {
				1: risk
			},
			year: year
		}
	})
		.then(level => {
			return res.status(201).json(level.serialize());
		})
		.catch(err => {
			return res.status(err.code).json(err);
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