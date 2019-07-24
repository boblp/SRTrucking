'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');
const collectionName = config.collections.orders;
const json2csv = require('json2csv');
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
		destiny: { $ne: '' }
	};

	const deckQuery = {
		POD: { $eq: '' },
        rc: { $eq: '' },
        paymentNafinas: { $eq: '' },
        invoice: { $eq: ''}
	};

	if (request.query.origin){
		query.origin = request.query.origin
	}

	if (request.query.destination){
		query.origin = request.query.destination
	}

	if (request.query.isDelivered){
		deckQuery.status = 'delivered'
	}else{
		deckQuery.status = { $ne: 'delivered' };
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
	    	"decks.orderId": "$_id"
	    }
	},{
	    $replaceRoot: { 
	        newRoot: "$decks" 
	    } 
	},{
	    $match: deckQuery
	}];

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
					margin : 0
				};

				result.forEach(function(element) {
					data.totalSale += parseInt(element.totalSale);
					data.actualPrice += parseInt(element.actualPrice);
					data.margin += parseInt(element.margin);
				});

				data.decks = result;

				callback(data);
			}
		}
	});
}

const exportExcel = function(results, callback){
	const json2csv = require('json2csv').parse;
	const fields = ['srt', 'timeWindow'];
	const opts = { fields };

	try {
		const csv = json2csv(results, opts);
		callback(csv);
	} catch (err) {
		console.error(err);
		callback(err);
	}
}