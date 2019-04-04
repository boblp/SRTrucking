'use strict';
const assert = require('assert');
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
			console.log(e.message);
			resolve(e.message);
		}
	}); 

	return promise;
}

const main = function(request, callback){
	const collection = request.mongo.db.collection(collectionName);
	let response = '';

	const user = request.query.user;
	const password = request.query.password;

	const query = {
		email: user
	};

	collection.findOne(query, function(err, result) {
		if(err){ 
			callback(err);
		}else{
			bcrypt.compare(password, result.password, function(err, res) {
				if(res){
					const token = jwt.sign({ id: result.email }, 'secret', {
						expiresIn: 86400 // 24 hours
					});

					response = token;
				}else{
					response = 'No Match';
				}

				callback(response);
			});
		}
	});
}