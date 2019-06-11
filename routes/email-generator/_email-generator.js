'use strict';
const assert = require('assert');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const moment = require("moment");
const config = require('../../util/config.js');
const ObjectId = require('mongodb').ObjectID;
const puppeteer = require('puppeteer');

const collectionName = config.collections.orders;
var response = { data: '', totalRecords: 0 };

module.exports.handler = function(request, h){
	const promise = new Promise((resolve, reject) => {
		try{
			jwt.verify(request.query.auth, 'secret', function(err, decoded) {
		    	if (err){
		    		resolve('Invalid Code or Level'); 
		    	} else {
		    		main(request, decoded, function(response){
						resolve(response);
					});
		    	}
		    });
		}catch(e){
			resolve(e.message);
		}
	}); 

	return promise;
}

const main = function(request, decoded, callback){
	const collection = request.mongo.db.collection(collectionName);
	const insertObject = {
		email: request.query.email,
		createdBy: decoded.id,
		createdAt: moment(Date.now()).format('YYYY-MM-DD')
	};

	const deckIds = JSON.parse(request.query.deckIds);

	const deckQuery = {
		$or: []
	};

	for (var i = deckIds.length - 1; i >= 0; i--) {
		deckQuery.$or.push({
			deckNumber: deckIds[i]
		});
	}

	if(request.query.deckIds){
		insertObject.deckData = request.query.deckData
	}

	var pipeline = [{
		$match: {
			_id: ObjectId(request.query.orderId)
		}
	}, {
		$unwind: '$decks'
	}, {
	    $replaceRoot: { 
	        newRoot: "$decks" 
	    } 
	}, {
	    $match: deckQuery
	},{
		$project: selectMode(request.query.mode)
	}];

	console.log(JSON.stringify(pipeline));

	collection.aggregate(pipeline, {}, function(err, result) {
		if(err){ callback(err); }else{
			var html = '<table><tr>';

			for(var j in result[0]) {
				html += '<th>' + j + '</th>';
			}

			html += '</tr>';
			
			for( var i = 0; i < result.length; i++) {
				html += '<tr>';
				for( var j in result[i] ) {
					html += '<td>' + result[i][j] + '</td>';
				}
			}

			html += '</table>';

			createImageFromHTML(html, callback).catch(console.error);;
		}
	});
}

async function createImageFromHTML(html, callback){
	var filePath = 'email/images/';
	var fileName = Date.now() + Math.floor(Math.random() * 100) + '.png';
	filePath += fileName;
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setContent(html);
	await page.screenshot({path: filePath});
	await browser.close();
	console.log("El archivo está en: %s",filePath);
	callback(filePath);
}

const selectMode = function(mode){
	const project = {
		deckNumber: 1,
		loadDate: 1,
		invoice: 1,
		status: 1,
		vehicleType: 1
	};

	if(mode == 'National MX'){
		project.carrierMX = 1;
		project.tractor = 1;
	}else if(mode == 'Import'){
		project.teamUS = 1;
		project.teamMX = 1;
		project.scac = 1;
		project.caat = 1;
		project.carrierMX = 1;
		project.carrierUS = 1;
		project.transfer = 1;
		project.cross = 1;
	}else if(mode == 'Export'){
		project.plates = 1;
		project.state = 1;
		project.scac = 1;
		project.caat = 1;
		project.carrierMX = 1;
		project.transfer = 1;
		project.cross = 1;
	}else if(mode == 'National US'){
		project.carrierUS = 1;
		project.extra = 1;
	}

	return project;
}