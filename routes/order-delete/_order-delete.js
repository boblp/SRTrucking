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
	const query = {
		_id: ObjectId(request.query.id)
	};

	const updateObj = {
		$set: {
			deleted: true
		}
	};

	collection.updateOne(query, updateObj, function(err, result) {
		if(err){ response = err }else{
			response = 'success';
		}

		callback(response);
	});
}