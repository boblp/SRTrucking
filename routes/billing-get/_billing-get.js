'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');
const collectionName = config.collections.orders;
const json2csv = require('json2csv');
const moment = require('moment');
const downloadCsv = require('download-csv');

module.exports.handler = function(request, h){
	const promise = new Promise((resolve, reject) => {
		try{
			jwt.verify(request.query.auth, 'secret', function(err, decoded) {
		    	if (err){
		    		resolve('Invalid Code or Level'); 
		    	} else {
		    		main(request, function(response){
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

const main = function(request, callback){
	const collection = request.mongo.db.collection(collectionName);

	const query = {
		origin: { $ne: '' },
		destiny: { $ne: '' },
		deleted: false
	};

	const deckQuery = {};

	if (request.query.origin){
		query.origin = request.query.origin
	}

	if (request.query.destination){
		query.destiny = request.query.destination
	}

	if (request.query.isDelivered){
		deckQuery.status = 'delivered'
	}

	if (request.query.missingClientInvoice){
		deckQuery.invoiceClient = { $eq: '' };
	}

	//if (request.query.missingVendorInvoice){
	//	deckQuery.cross = { invoice: { $eq: '' }};
	//	deckQuery.empty = { invoice: { $eq: '' }};
	//}

	if(request.query.hasPOD){
		deckQuery.POD = { $ne: "" };
	}

	if (request.query.startDate){
		let queryDateStart = moment(request.query.startDate, 'YYYY-MM-DD', true);

		console.log(queryDateStart.format("YYYY-MM-DD"), queryDateStart.isValid())

		if(queryDateStart.isValid()){
			query.createdAt = { $gt: queryDateStart.format("YYYY-MM-DD") };
		}
	}

	if (request.query.endDate){
		let queryDateEnd = moment(request.query.endDate, 'YYYY-MM-DD', true);
		console.log(queryDateEnd.format("YYYY-MM-DD"), queryDateEnd.isValid())

		if(queryDateEnd.isValid()){
			query.createdAt = { $lt: queryDateEnd.format("YYYY-MM-DD") };
		}
	}

	var pipeline = [{
	    $match: query
	},{
	    $unwind: '$decks'
	},{
	    $addFields: {
	    	"decks.orderId": "$_id"
	    }
	},{
	    $replaceRoot: { 
	        newRoot: "$decks" 
	    } 
	},{
	    $match: deckQuery
	}];

	if(request.query.missingRCNafinas){
		var rcQuery = { 
			$match: { 
				$or: [{ 
					rc: { $eq: '' }, 
					paymentNafinas: { $eq: '' } 
				}] 
			} 
		}

		pipeline.push(rcQuery);
	}

	collection.aggregate(pipeline, {}, function(err, result) {
		if(err){ callback(err); }else{
			if (request.query.returnExcel) {
				exportExcel(result, function(csv){
					callback(csv);
				});
			}else{
				var data = {
					totalSale : 0,
					actualPrice : 0,
					margin : 0,
				};

				result.forEach(function(element) {
					data.totalSale += parseInt(element.totalSale);
					data.actualPrice += parseInt(element.actualPrice);
					data.margin += parseInt(element.margin);
				});

				data.totalRecords = result.length;
				data.decks = result;

				callback(data);
			}
		}
	});
}

const exportExcel = function(results, callback){
	const json2csv = require('json2csv').parse;
	const fields = csvFields();
	const opts = { fields };

	try {
		const csv = json2csv(results, opts);
		callback(csv);
	} catch (err) {
		console.error(err);
		callback(err);
	}
}

const csvFields = function(){
	const fields = [{
		label: 'Deck Number',
		value: 'deckNumber'
	},{
		label: 'SRT',
		value: 'srt'
	},{
		label: 'Invoice SRT',
		value: 'invoiceSRT'
	},{
		label: 'Rebilling',
		value: 'rebilling'
	},{
		label: 'RC',
		value: 'rc'
	},{
		label: 'Invoice Client',
		value: 'invoiceClient'
	},{
		label: 'Invoice Vendor',
		value: 'invoiceVendor'
	},{
		label: 'Payment Nafinas',
		value: 'paymentNafinas'
	}];

	
	fields.push({label:"CarrierMX Name",value:"carrierMX.name"});
	fields.push({label:"CarrierMX Invoice",value:"carrierMX.invoice"});
	fields.push({label:"CarrierMX Date",value:"carrierMX.date"});
	fields.push({label:"CarrierMX Cost",value:"carrierMX.cost"});
	fields.push({label:"CarrierMX Payment Date",value:"carrierMX.paymentDate"});
	fields.push({label:"CarrierMX Status",value:"carrierMX.status"});
	fields.push({label:"CarrierUS Name",value:"carrierUS.name"});
	fields.push({label:"CarrierUS Invoice",value:"carrierUS.invoice"});
	fields.push({label:"CarrierUS Date",value:"carrierUS.date"});
	fields.push({label:"CarrierUS Cost",value:"carrierUS.cost"});
	fields.push({label:"CarrierUS Payment Date",value:"carrierUS.paymentDate"});
	fields.push({label:"CarrierUS Status",value:"carrierUS.status"});
	fields.push({label:"Transfer Name",value:"transfer.name"});
	fields.push({label:"Transfer Invoice",value:"transfer.invoice"});
	fields.push({label:"Transfer Date",value:"transfer.date"});
	fields.push({label:"Transfer Cost",value:"transfer.cost"});
	fields.push({label:"Transfer Payment Date",value:"transfer.paymentDate"});
	fields.push({label:"Transfer Status",value:"transfer.status"});
	fields.push({label:"Cross Name",value:"cross.name"});
	fields.push({label:"Cross Invoice",value:"cross.invoice"});
	fields.push({label:"Cross Date",value:"cross.date"});
	fields.push({label:"Cross Cost",value:"cross.cost"});
	fields.push({label:"Cross Payment Date",value:"cross.paymentDate"});
	fields.push({label:"Cross Status",value:"cross.status"});
	fields.push({label:"Empty Name",value:"empty.name"});
	fields.push({label:"Empty Invoice",value:"empty.invoice"});
	fields.push({label:"Empty Date",value:"empty.date"});
	fields.push({label:"Empty Cost",value:"empty.cost"});
	fields.push({label:"Empty Payment Date",value:"empty.paymentDate"});
	fields.push({label:"Empty Status",value:"empty.status"});
	fields.push({label:"Actual Price",value:"actualPrice"});
	fields.push({label:"Total Sale",value:"totalSale"});
	fields.push({label:"Profit",value:"margin"});
	fields.push({label:"Notes",value:"notes"});

	return fields;
}