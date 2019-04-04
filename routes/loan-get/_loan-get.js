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
		    	if (err) { callback('Invalid Code') }else{
		    		main(decoded.id, request, function(response){
						resolve(response);
					});
		    	}
		    });
		}catch(e){
			console.log(e.message)
			response.data = e.message;
			resolve(response);
		}
	}); 

	return promise;
}

const main = function(email, request, callback){
	const collection = request.mongo.db.collection(collectionName);

	const query = { email: email };
	collection.findOne(query, function(err, result) {
		if(err){ callback(err); }else{
			callback(result);
		}
	});
}