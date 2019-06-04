'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');
const moment = require('moment');
const async = require('async');
const uniqid = require('uniqid');
const collectionNameOrders = config.collections.orders;
const collectionNameConfig = config.collections.configs;
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
	const collectionOrders = request.mongo.db.collection(collectionNameOrders);
	const collectionConfigs = request.mongo.db.collection(collectionNameConfig);
	const deckArray = [];
	let srt = 0;

	const iterations = parseInt(request.query.qty);

	collectionConfigs.update({}, { $inc: { srt: 1 } }, { upsert: false }, function(err, resultConfig) {
		if(err){ response = err }else{
			response = 'success';
			callback(response);
		}

		console.log(resultConfig);
		//var currentSRT = resultConfig[0].srt;
		var currentSRT = 100;

		async.timesSeries(iterations, function(n, next) {
			srt = currentSRT-iterations;

		    addDeck(n, srt+n, function(err, user) {
		        next(err, user);
		    });
		}, function(err, decks) {
			const insertObject = {
				origin: request.query.origin,
				destiny: request.query.destiny,
				qty: request.query.qty,
				type: request.query.type,
				time: request.query.time,
				fz: request.query.fz,
				volume: request.query.volume,
				decks: decks,
				client: "Metalsa",
				createdBy: decoded.id,
				createdAt: moment(Date.now()).format('DD-MM-YYYY'),
				modifiedAt: moment(Date.now()).format('DD-MM-YYYY'),
				lastModifier: decoded.name,
				deleted: false,
				delivered: false
			};

			collectionOrders.insertOne(insertObject, function(err, result) {
				if(err){ response = err }else{
					response = 'success';
				}

				callback(response);
			});
		});
	});
}

var addDeck = function(id, srt, callback) {
    callback(null, {
        id: uniqid(),
        deckNumber: id+1,
		srt: srt,
		timeWindow: '',
		documentsDate: '',
		invoice: '',
		teamUS: '',
		teamMX: '',
		vehicleType: '',
		scac: '',
		caat: '',
		cross: {
			name: '',
			invoice: '',
			date: '',
			cost: 0,
			paymentDate: '',
			status: 'Not Started'
		},
		carrierMX: {
			name: '',
			invoice: '',
			date: '',
			cost: 0,
			paymentDate: '',
			status: 'Not Started'
		},
		carrierUS: {
			name: '',
			invoice: '',
			date: '',
			cost: 0,
			paymentDate: '',
			status: 'Not Started'
		},
		documentsStatus: '',
		status: '',
		transfer: {
			name: '',
			invoice: '',
			date: '',
			cost: 0,
			paymentDate: '',
			status: 'Not Started'
		},
		local: {
			name: '',
			invoice: '',
			date: '',
			cost: 0,
			paymentDate: '',
			status: 'Not Started'
		},
		extra: '',
		empty: {
			name: '',
			invoice: '',
			date: '',
			cost: 0,
			paymentDate: '',
			status: 'Not Started'
		},
		tractor: '',
		//master stuff:
		//srt

		//carrierMX
		//CarrierUS
		//cross
		//local
		//transfer

		invoiceSRT: '',
		invoiceClient: '',
		rc: '',
		paymentNafinas: '',
		POD : '',
		POD_file : '',
		vendorInvoice : '',
		vendorInvoice_file : '',
		vendorPaymentReceipt : '',
		vendorPaymentReceipt_file : '',
		paymentAddOn : '',
		paymentAddOn_file : '',
		clientInvoice : '',
		clientInvoice_file : '',
		equipment: '',
		equipmentNum: '',
		totalSale: 0,
		actualPrice: 0,
		margin: 0,
		notes: '',
		instructionsLetter: '',
		delivered: 'false',
		flat_or_equipment: '',
		flat: '',
		plates: '',
		state: '',
		vendorPaymentStatus: 'false',
		clientPaymentStatus: 'false'
    });
};