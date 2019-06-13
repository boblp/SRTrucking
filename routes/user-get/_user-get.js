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
		disabled: false
	};

	if(request.query.viewDisabled){
		query.disabled = request.query.viewDisabled;
	}

	collection.find(query).toArray(function(err, result) {
		if(err){ callback(err); }else{
			callback(result);
		}
	});
}