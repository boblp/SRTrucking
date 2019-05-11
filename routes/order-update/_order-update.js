'use strict';
const assert = require('assert');
const jwt = require('jsonwebtoken');
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
	let response = '';

	const query = {
		_id: ObjectId(request.query.id)
	};

	const updateObj = {
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

	collection.updateOne(query, updateObj, { upsert: true },function(err, result) {
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
}