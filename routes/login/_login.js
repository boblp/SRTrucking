'use strict';

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const config = require('../../util/config.js');

const collectionName = config.collections.users;

module.exports.handler = function(request, h){
	const promise = new Promise((resolve, reject) => {
		try{
			main(request, function(response){
				resolve(response);
			});
		}catch(e){
			resolve(e.message);
		}
	}); 

	return promise;
}

const main = function(request, callback){
	const collection = request.mongo.db.collection(collectionName);
	let response = false;

	const user = request.query.user;
	const password = request.query.password;

	const query = {
		email: user,
		disabled: false
	};

	collection.findOne(query, function(err, result) {
		if(err){ 
			callback(response);
		}else{
			if (result) {
				bcrypt.compare(password, result.password, function(err, res) {
					if(res){
						var key = { 
							id: result.email, 
							level: result.level, 
							name: result.name 
						};

						response = jwt.sign(key, 'secret', {
							expiresIn: 86400 // 24 hours
						});
					}

					callback(response);
				});
			}else{
				callback(response);
			}
		}
	});
}