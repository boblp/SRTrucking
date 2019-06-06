'use strict';
const assert = require('assert');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectID;
const config = require('../../util/config.js');
let response = '';

const collectionName = config.collections.locations;

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

	let updateObj = {
		$set: {}
	};

	if(request.query.name){
		updateObj.$set.name = request.query.name
	}

	if(request.query.state){
		updateObj.$set.state = request.query.state
	}

	if(request.query.country){
		updateObj.$set.country = request.query.country
	}

	if(request.query.disabled){
		updateObj.$set.disabled = request.query.disabled
	}

	const query = {
		_id: ObjectId(request.query.id),
	};

	updateObj.$set.modfiedAt = moment(Date.now()).format('YYYY-MM-DD');

	collection.updateOne(query, updateObj, function(err, result) {
		if(err){ 
			response = err;
		}else{
			response = 'success';
		}

		callback(response);
	});
}