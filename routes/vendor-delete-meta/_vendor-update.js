'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');
const ObjectId = require('mongodb').ObjectID
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
		_id: ObjectId(request.query.id)
	};

	let updateObj = {
		$set: {}
	};

	if(request.query.name){
		updateObj.$set.name = request.query.name;
	}

	if(request.query.alias){
		updateObj.$set.alias = request.query.alias;
	}

	if(request.query.origins){
		updateObj.$set.origins = request.query.origins.split(',');
	}

	if(request.query.destinies){
		updateObj.$set.destinies = request.query.destinies.split(',');
	}

	if(request.query.disabled){
		updateObj.$set.disabled = request.query.disabled;
	}

	collection.updateOne(query, updateObj, function(err, result) {
		if(err){ response = err }else{
			response = 'success';
		}

		callback(response);
	});
}