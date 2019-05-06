'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');
const moment = require('moment');
const collectionName = config.collections.orders;
let response = '';

module.exports.handler = function(request, h){
	const promise = new Promise((resolve, reject) => {
		try{
			jwt.verify(request.query.auth, 'secret', function(err, decoded) {
		    	if (err) { 
		    		resolve('Invalid Code or Level'); 
		    	}else{
					main(decoded, request, function(response){
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

const main = function(decoded, request, callback){
	const collection = request.mongo.db.collection(collectionName);
	const deckArray = [];
	let deckTemplate = {
		id: 1,
		srt: '',
		loadDate: '',
		timeWindow: '',
		documentsDate: '',
		crossDate: '',
		invoice: '',
		teamUS: '',
		teamMX: '',
		vehicleType: '',
		scac: '',
		caat: '',
		cross: '',
		carrierMX: '',
		carrierUS: '',
		documentsStatus: '',
		status: '',
		transferBusiness: '',
		local: '',
		extra: '',
		empty: '',
		tractor: '?'
	};

	for (var i = parseInt(request.query.qty) - 1; i >= 0; i--) {
		deckTemplate.id = i;
		deckArray.push(deckTemplate);
	}

	const insertObject = {
		origin: request.query.origin,
		destiny: request.query.destiny,
		qty: request.query.qty,
		type: request.query.type,
		time: request.query.time,
		fz: request.query.fz,
		volume: request.query.volume,
		decks: deckArray,
		client: "Metalsa",
		createdAt: moment(Date.now()).format('DD-MM-YYYY'),
		modifiedAt: moment(Date.now()).format('DD-MM-YYYY'),
		lastModifier: decoded.name
	};

	collection.insertOne(insertObject, function(err, result) {
		if(err){ response = err }else{
			response = 'success';
		}

		callback(response);
	});
}