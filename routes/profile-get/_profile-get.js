'use strict';
const assert = require('assert');
const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');

const collectionName = config.collections.users;
var response = { data: '', totalRecords: 0 };

module.exports.handler = function(request, h){
	const promise = new Promise((resolve, reject) => {
		try{
			jwt.verify(request.query.auth, 'secret', function(err, decoded) {
		    	if (err){
		    		resolve('Invalid Code or Level'); 
		    	} else {
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
		email: decoded.id
	};

	collection.findOne(query, function(err, result) {
		if(err){ callback(err); }else{
			callback(result);
		}
	});
}