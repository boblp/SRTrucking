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
		$push: {
			
		}
	};

	updateObj.$push[request.query.category] = {};

	if(request.query.category === 'transport'){
		updateObj.$push[request.query.category].price = request.query.price;
		updateObj.$push[request.query.category].destiny = request.query.destiny;
		updateObj.$push[request.query.category].origin = request.query.origin;
		updateObj.$push[request.query.category].mode = request.query.mode;
		updateObj.$push[request.query.category].type = request.query.type;

		collection.updateOne(query, updateObj, function(err, result) {
			if(err){ 
				response = err;
			}else{
				response = 'success';
			}

			callback(response);
		});
	}

	if(request.query.category === 'cross'){
		updateObj.$push[request.query.category].price = request.query.price;
		updateObj.$push[request.query.category].destiny = request.query.destiny;

		collection.updateOne(query, updateObj, function(err, result) {
			if(err){ 
				response = err;
			}else{
				response = 'success';
			}

			callback(response);
		});
	}

	if(request.query.category === 'transfer'){
		updateObj.$push[request.query.category].price = request.query.price;
		updateObj.$push[request.query.category].destiny = request.query.destiny;
		updateObj.$push[request.query.category].weight = request.query.weight;

		collection.updateOne(query, updateObj, function(err, result) {
			if(err){ 
				response = err;
			}else{
				response = 'success';
			}

			callback(response);
		});
	}

	if(request.query.category === 'empty'){
		updateObj.$push[request.query.category].price = request.query.price;
		updateObj.$push[request.query.category].destiny = request.query.destiny;
		updateObj.$push[request.query.category].type = request.query.type;

		collection.updateOne(query, updateObj, function(err, result) {
			if(err){ 
				response = err;
			}else{
				response = 'success';
			}

			callback(response);
		});
	}
}