'use strict';
const assert = require('assert');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const moment = require('moment');
const config = require('../../util/config.js');
let response = '';

const collectionName = config.collections.users;

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
	let updateObj = {
		$set: {}
	};

	if(request.query.name){
		updateObj.$set.name = request.query.name
	}

	if(request.query.level){
		updateObj.$set.level = request.query.level
	}

	if(request.query.phone){
		updateObj.$set.phone = request.query.phone
	}

	if(!request.query.disabled){
		if(request.query.password){
			bcrypt.hash(request.query.password, 10, function(err, hashedPassword) {
				updateUser(collection, hashedPassword, request, updateObj, callback);
			});
		}else{
			updateUser(collection, null, request, updateObj, callback);
		}
	}else{
		disableUser(collection, request.query.email, callback);
	}
}

var updateUser = function(collection, password, request, updateObj, callback){
	const query = {
		email: request.query.email
	};

	if(password){
		updateObj.$set.password = password
	}

	updateObj.$set.modifiedAt = moment(Date.now()).format('DD-MM-YYYY');

	collection.updateOne(query, updateObj, function(err, result) {
		if(err){ 
			response = err;
		}else{
			response = 'success';
		}

		callback(response);
	});
};

var disableUser = function(collection, email, callback){
	const query = {
		email: email
	};

	const updateObj = {
		$set: {
			disabled: true,
			modifiedAt: moment(Date.now()).format('DD-MM-YYYY')
		}
	};

	collection.updateOne(query, updateObj, function(err, result) {
		if(err){ 
			response = err;
		}else{
			response = 'success';
		}

		callback(response);
	});
};

