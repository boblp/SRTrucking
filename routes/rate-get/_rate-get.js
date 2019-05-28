'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');
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

	var pipeline = [{
	    $match:{ 
	        transport: { 
	            $exists: true, 
	            $not: { $size: 0 } 
	        } 
	    }
	},{
	    $unwind: '$'+request.query.type
	},{
	    $project: {
	        name: 1,
	        alias: 1,
	        transport:1
	    }
	},{
	    $match: {
	        "transport.type": request.query.equipment
	    }
	}];

	collection.aggregate(pipeline, {}, function(err, result) {
		if(err){ callback(err); }else{
			callback(result);
		}
	});
}