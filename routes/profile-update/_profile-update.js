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
	let updateObj = {
		$set: {}
	};

	if(request.query.name){
		updateObj.$set.name = request.query.name
	}

	if(request.query.phone){
		updateObj.$set.phone = request.query.phone
	}

	if(request.query.profilePic){
		updateObj.$set.profilePic = request.query.profilePic;
	}

	if(request.query.signaturePic){
		updateObj.$set.signaturePic = request.query.signaturePic;
	}

	if(request.query.password){
		bcrypt.hash(request.query.password, 10, function(err, hashedPassword) {
			updateUser(collection, decoded, hashedPassword, request, updateObj, callback);
		});
	}else{
		updateUser(collection, decoded, null, request, updateObj, callback);
	}
}

var updateUser = function(collection, decoded, password, request, updateObj, callback){
	const query = {
		email: decoded.id
	};

	if(password){
		updateObj.$set.password = password
	}

	updateObj.$set.modifiedAt = moment(Date.now()).format('YYYY-MM-DD');

	collection.updateOne(query, updateObj, function(err, result) {
		if(err){ 
			response = err;
		}else{
			response = 'success';
		}

		callback(response);
	});
};

