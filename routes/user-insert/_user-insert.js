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
	const email = request.query.email.toLowerCase();
	const password = request.query.password;
	const level = request.query.level;

	bcrypt.hash(password, 10, function(err, hashedPassword) {
		const query = {
			email: email
		};

		const insertObject = {
			$set: {
				modifiedAt: moment(Date.now()).format('YYYY-MM-DD')
			},
			$setOnInsert: {
				name: name,
				phone: 0,
				email: email,
				password: hashedPassword,
				createdAt: moment(Date.now()).format('YYYY-MM-DD'),
				level: level,
				disabled: false,
				profilePic: 'https://s3.amazonaws.com/srt-trucking/profile/user_pic.jpg',
				signaturePic: 'https://s3.us-east-1.amazonaws.com/srt-trucking/signature/1560021967516_1560021967.png'
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