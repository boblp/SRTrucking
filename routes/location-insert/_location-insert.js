'use strict';
const assert = require('assert');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const moment = require('moment');
const config = require('../../util/config.js');

const collectionName = config.collections.locations;

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
		state: request.query.state,
		country: request.query.country,
		disabled: false
	};

	collection.insertOne(insertObject, function(err, result) {
		if(err){ response = err }else{
			response = 'success';
		}

		callback(response);
	});
}