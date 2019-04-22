'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');
const collectionName = config.collections.vendor;

module.exports.handler = function(request, h){
	const promise = new Promise((resolve, reject) => {
		try{
			jwt.verify(request.query.auth, 'secret', function(err, decoded) {
		    	if (err || decoded.level != 5) { 
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
	let response = '';

	const insertObject = {
		name: request.query.name
	};

	if(request.query.origin){
		insertObject.origin = request.query.origin
	}

	if(request.query.destiny){
		insertObject.destiny = request.query.destiny
	}

	collection.insertOne(insertObject, function(err, result) {
		if(err){ response = err }else{
			response = 'success';
		}

		callback(response);
	});
}