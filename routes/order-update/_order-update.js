'use strict';
const assert = require('assert');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const moment = require('moment');
const config = require('../../util/config.js');

const collectionName = config.collections.orders;

module.exports.handler = function(request, h){
	const promise = new Promise((resolve, reject) => {
		try{
			jwt.verify(request.query.auth, 'secret', function(err, decoded) {
		    	if (err) { 
		    		resolve('Invalid Code or Level'); 
		    	}else{
		    		if(decoded.level == 1){
		    			main(decoded, request, function(response){
							resolve(response);
						});
		    		}else if (decoded.level == 2) {
		    			main(decoded, request, function(response){
							resolve(response);
						});
		    		}else if (decoded.level == 3) {
		    			main(decoded, request, function(response){
							resolve(response);
						});
		    		}else if (decoded.level == 4) {
		    			main(decoded, request, function(response){
							resolve(response);
						});
		    		}else if (decoded.level == 5) {
		    			main(decoded, request, function(response){
							resolve(response);
						});
		    		}else{
		    			resolve('Invalid Code or Level :C'); 
		    		}
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
	var hashedPassword = bcrypt.hashSync(request.query.password, 8);
	let response = '';

	const name = request.query.name;
	const email = request.query.email;
	const password = request.query.password;
	const confirmPassword = request.query.confirmPassword;
	const level = request.query.level;

	if(password !== confirmPassword){
		callback("Passwords don't match.");
	}else{
		bcrypt.hash(password, 10, function(err, hashedPassword) {
			const query = {
				email: email
			};

			const insertObject = {
				$set: {
					modfiedAt: moment(Date.now()).format('DD-MM-YYYY')
				},
				$setOnInsert: {
					name: name,
					email: email,
					password: hashedPassword,
					createdAt: moment(Date.now()).format('DD-MM-YYYY'),
					level: level
				}
			};

			collection.updateOne(query, insertObject, { upsert: true },function(err, result) {
				if(err){ 
					response = err;
				}else{
					if(result.upsertedId === null && result.matchedCount === 1){
						response = 'This user already exists';
					}else{
						response = 'success';
					}
				}

				callback(response);
			});
		});
	}
}