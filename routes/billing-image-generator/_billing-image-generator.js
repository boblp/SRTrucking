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

	const query = {
		origin: { $ne: '' },
		destiny: { $ne: '' }
	};

	const deckQuery = {
		POD: { $eq: '' },
        rc: { $eq: '' },
        paymentNafinas: { $eq: '' },
        invoice: { $eq: ''}
	};

	const projectQuery = {
		srt: 1,
		equipmentNum: 1,
		invoice: 1,
		vehicleType: 1,
		totalSale:1,
		orderId : 1,
		origin : 1,
		destiny : 1

	};

	if (request.query.origin){
		query.origin = request.query.origin
	}

	if (request.query.destination){
		query.origin = request.query.destination
	}

	if (request.query.isDelivered){
		deckQuery.POD = { $ne: '' };
	}

	if (request.query.hasRC){
		deckQuery.rc = { $ne: '' };
		deckQuery.paymentNafinas = { $ne: '' };
	}

	if (request.query.hasClientInvoice){
		deckQuery.invoiceClient = { $ne: '' };
	}

	var pipeline = [{
	    $match: query
	},{
	    $unwind: '$decks'
	},{
	    $addFields: {
	    	"decks.orderId": "$_id",
	    	"decks.origin": "$origin",
	    	"decks.destiny": "$destiny"
	    }
	},{
	    $replaceRoot: { 
	        newRoot: "$decks" 
	    } 
	},{
	    $match: deckQuery
	},{
		$project: projectQuery
	}
	];

	console.log(JSON.stringify(pipeline));

	collection.aggregate(pipeline, {}, function(err, result) {
		if(err){ callback(err); }else{
			var text = '';
			var html = '';
			html += '<table style="font-family:Verdana;text-align:center;"><thead style="background: #0B6FA4;"><tr>';
			for(var j in result[0]) {
				if (j == 'deckNumber') {
					text = '#'
				}else{
					text = j;
				}

				html += '<th style="padding:3px 2px;font-size:12px;color:#fff;text-align:center;">' + text + '</th>';
			}

			html += '</thead></tr>';
			
			for( var i = 0; i < result.length; i++) {
				html += '<tr>';
				for( var j in result[i] ) {
					html += '<td style="padding:3px 2px;font-size:10px">' + result[i][j] + '</td>';
				}
			}

			html += '</table>';

			createImageFromHTML(html, result.length, callback).catch(console.error);
		}
	});
}

async function createImageFromHTML(html, count, callback){
	var filePath = 'email/images/';
	var fileName = Date.now() + Math.floor(Math.random() * 100) + '.png';
	filePath += fileName;
	const browser = await puppeteer.launch({
		headless: true,
		args: [
			'--no-sandbox',
	        '--disable-setuid-sandbox',
	        '--disable-dev-shm-usage'
	    ]
	});
	const page = await browser.newPage();
	await page.setViewport({ width: 0, height: 40+(count*20) });
	await page.setContent(html);
	await page.screenshot({path: filePath, fullPage: true});
	await browser.close();
	console.log("El archivo está en: %s",filePath);
	console.log('test');
	callback(filePath);
}
