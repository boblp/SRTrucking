'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');
const collectionName = config.collections.vendors;

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

	const query = {
		_id: request.query.id
	};

	const insertObject = {
		$set: {},
		$push: {}
	};

	insertObject.$set.name = request.query.name;
	//insertObject.$push.origin = 

	collection.updateOne(query, insertObject, function(err, result) {
		if(err){ response = err }else{
			response = 'success';
		}

		callback(response);
	});
}