'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const { Risk } = require('../level_1/models');
const { User } = require('../users/models');
const { localStrategy, jwtStrategy } = require('../auth/strategies');
const router = express.Router();
router.use(bodyParser.json());

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.put('/invest', jwtAuth, (req, res) => {

	//validate the fields in the body
	const requiredFields = ['mattress', 'conservative', 'moderate','aggressive', 'google', 'autoZone', 'dollarTree', 'ea','year','currentFund'];
    
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

	let { mattress, 
		conservative, 
		moderate, 
		aggressive, 
		google, 
		autoZone, 
		dollarTree, 
		ea, 
		year, 
		currentFund } = req.body;

	let newCurrentFundAmt = 0;
	let totalFundIncrease = 0;
	let fundsInvested = 0;
	let fund_gain_loss = 0;

	//get the % increase/decrease from the Risk Db. This value
	//is determined by the year and risk level
	return Risk.find({
		x: { $in: [year] }
	})
		.then(riskData => {
			console.log('riskData = ', riskData);
			for (let i= 0; i < riskData.length; i++ ){
				switch (riskData[i].risk){
				case 'Google':
					fundsInvested = currentFund * parseFloat(google);
					break;

				case 'AutoZone':
					fundsInvested = currentFund * parseFloat(autoZone);
					break;

				case 'Electronic Arts':
					fundsInvested = currentFund * parseFloat(ea);
					break;

				case 'Dollar Tree':
					fundsInvested = currentFund * parseFloat(dollarTree);
					break;

				case 'Mattress':
					fundsInvested = currentFund * parseFloat(mattress);
					break;

				case 'Aggressive':
					fundsInvested = currentFund * parseFloat(aggressive);
					break;

				case 'Moderate':
					fundsInvested = currentFund * parseFloat(moderate);
					break;

				case 'Conservative':
					fundsInvested = currentFund * parseFloat(conservative);
					break;

				default:
					break;
				}
        
				fund_gain_loss = fund_gain_loss + (fundsInvested + (Math.floor(riskData[i].gain / 100 * fundsInvested))); 
			}

			totalFundIncrease = fund_gain_loss-currentFund;
			newCurrentFundAmt = totalFundIncrease + currentFund;


			let growth = ((newCurrentFundAmt - currentFund)/currentFund) * 100;
			return User.findByIdAndUpdate(
				req.user.id,
				{
					$set: {
						currentFund: newCurrentFundAmt,
						previousFund: currentFund,
						year: year
					},
					$push: {
						risk: {
							x: year,
							y: newCurrentFundAmt,
							strategy: null,
							previousYear: currentFund,
							growth: growth
						}
					}
				},
				{ new: true }
			)
				.then(data => {
					return res.status(200).json(data);
				})
				.catch(err => {
					return res.status(500).json(err);
				});
		})
		.catch(err => {
			return res.status(500).json(err);
		});
});

module.exports = {router};