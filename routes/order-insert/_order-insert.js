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

	collectionConfigs.findOneAndUpdate({}, { $inc: { srt: iterations } }, {}, function(err, resultConfig) {
		if(err){ response = err }else{
			response = 'success';
			callback(response);
		}

		var currentSRT = resultConfig.value.srt;

		async.timesSeries(iterations, function(n, next) {
			srt = currentSRT;

		    addDeck(n, srt+n, request.query.time, function(err, user) {
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
				createdAt: moment(Date.now()).format('YYYY-MM-DD'),
				modifiedAt: moment(Date.now()).format('YYYY-MM-DD'),
				lastModifier: decoded.name,
				deleted: false,
				delivered: false
			};

			if(request.query.notes){
				insertObject.creationNotes = request.query.notes;
			}

			collectionOrders.insertOne(insertObject, function(err, result) {
				if(err){ response = err }else{
					response = 'success';
				}

				callback(response);
			});
		});
	});
}

var addDeck = function(id, srt, time, callback) {
    callback(null, {
        id: uniqid(),
        deckNumber: id+1,
		srt: "SRT"+srt,
		timeWindow: moment(time, 'hh:mmA').add(id+1, 'hour').format('hh:mmA'),
		documentsDate: '',
		teamUS: '',
		teamMX: '',
		vehicleType: '',
		scac: '',
		caat: '',
		driver: '',
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
		documentsStatus: 'Pending',
		status: 'Not Started',
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
		extra: {
			name: '',
			invoice: '',
			date: '',
			cost: 0,
			paymentDate: '',
			status: 'Not Started'
		},
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
		invoiceVendor: '',
		rc: '',
		paymentNafinas: '',
		rebilling: '',
		POD : '',
		POD_file : '',
		vendorInvoice : '',
		vendorInvoiceXml : '',
		vendorInvoiceXml_file : '',
		vendorInvoice_file : '',
		vendorPaymentReceipt : '',
		vendorPaymentReceipt_file : '',
		paymentAddOn : '',
		paymentAddOn_file : '',
		clientInvoice : '',
		clientInvoiceXml : '',
		clientInvoiceXml_file : '',
		clientInvoice_file : '',
		equipment: '',
		equipmentNum: '',
		totalSale: 0,
		actualPrice: 0,
		margin: 0,
		notes: '',
		instructionsLetter_file: '',
		manifest_file: '',
		motion_file: '',
		releaseOrder_file: '',
		flat_or_equipment: '',
		flat: '',
		plates: '',
		state: '',
		vendorPaymentStatus: 'false',
		clientPaymentStatus: 'false',
		deliveryDate: '',
		clientRepresentative: '',
		model: ''
    });
};