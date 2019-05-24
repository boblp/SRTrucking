'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');
const ObjectId = require('mongodb').ObjectID;
const collectionName = config.collections.vendors;

module.exports.handler = function(request, h){
	const promise = new Promise((resolve, reject) => {
		try{
			jwt.verify(request.query.auth, 'secret', function(err, decoded) {
		    	if (err){
		    		resolve('Invalid Code or Level'); 
		    	} else {
		    		main(request, function(response){
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

const main = function(request, callback){
	const collection = request.mongo.db.collection(collectionName);
	const sort = {
		name:-1
	};

	const query = {
		disabled: false
	};

	if(request.query.id){
		query._id = ObjectId(request.query.id);
	}

	if(request.query.name){
		query.name = request.query.name;
	}

	if(request.query.viewDisabled){
		query.disabled = request.query.viewDisabled;
	}

	collection.find(query).sort(sort).toArray(function(err, result) {
		if(err){ callback(err); }else{
			callback(result);
		}
	});
}