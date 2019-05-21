'use strict';
const assert = require('assert');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const moment = require('moment');
const config = require('../../util/config.js');

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
	var hashedPassword = bcrypt.hashSync(request.query.password, 8);
	let response = '';

	const name = request.query.name;
	const email = request.query.email;
	const password = request.query.password;
	const level = request.query.level;

	bcrypt.hash(password, 10, function(err, hashedPassword) {
		const query = {
			email: email
		};

		const insertObject = {
			$set: {
				modifiedAt: moment(Date.now()).format('DD-MM-YYYY')
			},
			$setOnInsert: {
				name: name,
				phone: 0,
				email: email,
				password: hashedPassword,
				createdAt: moment(Date.now()).format('DD-MM-YYYY'),
				level: level,
				disabled: false,
				profilePic: ''
			}
		};

		if(request.query.phone){
			insertObject.$setOnInsert.phone = request.query.phone;
		}

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