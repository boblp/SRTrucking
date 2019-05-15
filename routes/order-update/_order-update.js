'use strict';
const assert = require('assert');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const async = require('async');
const ObjectId = require('mongodb').ObjectID;
const config = require('../../util/config.js');
let response = '';

const collectionName = config.collections.orders;

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
	const updateObj = JSON.parse(request.query.updateObject);

	// const structureExample = [{
	// 	id: "be7l4lsjvlld4eo",
	// 	srt: "updateSuccess1",
	// 	tractor: "hhhhh"
	// },{
	// 	id: "be7l4lsjvlld4ep",
	// 	srt: "updateSuccess2",
	// 	tractor: "ppppp"
	// }]

	async.each(updateObj, function(data, cb) {
	    updateDeck(request.query.id, data, collection, function(){
	    	cb();
	    });
	}, function(err) {
	    if (err) { callback(err); }else{
	    	callback('success');
	    }
	});
}

const updateDeck = function(id, data, collection, callback){
	const query = {
		_id: ObjectId(id),
		"decks.id": data.id
	};

	var newData = {};

	async.eachOf(data, function(dataRow, key, cb2) {
		console.log(key, dataRow);
		if(key != 'id' && key != 'cross' && key != 'carrierMX' && key != 'carrierUS' && key != 'transfer' && key != 'local' && key != 'empty'){
			newData['decks.$.'+key] = dataRow;
		}

		cb2();
	}, function(err) {
	    if( err ) { console.log(err) } else {
	    	const updateObj = {
		        $set: newData
		    };

		    console.log(query);
		    console.log(updateObj);

			collection.updateOne(query, updateObj, { upsert: false }, function(err, result) {
				if(err){ 
					console.log(err);
					response = err;
				}else{
					if(result.upsertedId === null && result.matchedCount === 1){
						response = 'This user already exists';
					}else{
						response = 'success';
					}
				}

				callback(err, response);
			});
	    }
	});
};