'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');
const ObjectId = require('mongodb').ObjectID;
const collectionName = config.collections.orders;
const moment = require('moment');

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
		deleted: false
	};

	if(request.query.id){
		query._id = ObjectId(request.query.id)
	}

	if(request.query.srt){
		query.srt = request.query.srt
	}

	if(request.query.createdAt){
		query.createdAt = request.query.createdAt
	}

	if(request.query.delivered){
		query.decks = {
			$not: {
				$elemMatch:{
					"status": {
			           $ne: "delivered"
			        }
				}
			}
		};
		query["decks.status"] = "delivered";
	}else{
		query.decks = {
			$not: {
				$elemMatch:{
					"status": {
			           $eq: "delivered"
			        }
				}
			}
		};
	}

	if(request.query.type){
		query.type = request.query.type
	}

	if(request.query.location){
		query.$or = [
			{
				origin: request.query.location
			},
			{
				destiny: request.query.location
			}
		]
	}

	if(request.query.mineOnly){
		query.createdBy = decoded.id
	}

	if (request.query.daysBack){
		let queryDate = moment().subtract(request.query.daysBack, 'days').format("YYYY-MM-DD");
		query.createdAt = { $gt: queryDate };
	}

	console.log(JSON.stringify(query));

	collection.find(query).toArray(function(err, result) {
		if(err){ callback(err); }else{
			if(request.query.returnExcel){
				exportExcel(result, function(csv){
					callback(csv);
				});
			}else{
				callback(result);
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