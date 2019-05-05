'use strict';

const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const moment = require('moment');
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
	const category = request.query.category;
	const query = {
		_id: ObjectId(request.query.id)
	};

	let updateObj = {
		$push: {
			
		}
	};

	updateObj.$push[category] = {
		id: uniqid(),
		createdAt: moment(Date.now()).format('DD-MM-YYYY')
	};

	if(category === 'transport'){
		updateObj.$push[category].price = request.query.price;
		updateObj.$push[category].destiny = request.query.destiny;
		updateObj.$push[category].origin = request.query.origin;
		updateObj.$push[category].mode = request.query.mode;
		updateObj.$push[category].type = request.query.type;

		collection.updateOne(query, updateObj, function(err, result) {
			if(err){ 
				response = err;
			}else{
				response = 'success';
			}

			callback(response);
		});
	}

	if(category === 'cross'){
		updateObj.$push[category].price = request.query.price;
		updateObj.$push[category].destiny = request.query.destiny;

		collection.updateOne(query, updateObj, function(err, result) {
			if(err){ 
				response = err;
			}else{
				response = 'success';
			}

			callback(response);
		});
	}

	if(category === 'transfer'){
		updateObj.$push[category].price = request.query.price;
		updateObj.$push[category].destiny = request.query.destiny;
		updateObj.$push[category].weight = request.query.weight;

		collection.updateOne(query, updateObj, function(err, result) {
			if(err){ 
				response = err;
			}else{
				response = 'success';
			}

			callback(response);
		});
	}

	if(category === 'empty'){
		updateObj.$push[category].price = request.query.price;
		updateObj.$push[category].destiny = request.query.destiny;
		updateObj.$push[category].type = request.query.type;

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