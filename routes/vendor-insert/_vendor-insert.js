'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');
const collectionName = config.collections.vendors;

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
	let response = '';

	const insertObject = {
		name: request.query.name,
		shippings: 0,
		setbacks: 0,
		disabled: false
	};

	if(request.query.alias){
		insertObject.alias = request.query.alias
	}else{
		insertObject.alias = request.query.name
	}

	if(request.query.origins){
		insertObject.origins = request.query.origins.split(',');
	}

	if(request.query.destinies){
		insertObject.destinies = request.query.destinies.split(',');
	}

	collection.insertOne(insertObject, function(err, result) {
		if(err){ response = err }else{
			response = 'success';
		}

		callback(response);
	});
}