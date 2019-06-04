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
	    $match: {
	        $or: [{ 
	            "transport.type": request.query.equipment,
	            "transport.destiny": request.query.destination,
	            "transport.origin": request.query.origin
	        },{
	            "cross.type": request.query.equipmentType,
	            "cross.destiny": request.query.destination
	        },{ 
	            "transfer.type": request.query.equipmentType,
	            "transfer.destiny": request.query.destination
	        }]
	    }
	},{
		$project: {
	        name: 1,
	        alias: 1,
	        transport: {
	            $filter: {
	                input: '$transport',
	                as: 'item',
	                cond: {
	                    $and: [
	                        { $eq: ['$$item.type', request.query.equipment] },
	                        { $eq: ['$$item.destiny', request.query.destination] },
	                        { $eq: ['$$item.origin', request.query.origin] }
	                    ]
	                }
	            }
	        },
	        transfer: {
	            $filter: {
	                input: '$transfer',
	                as: 'item',
	                cond: {
	                    $and: [
	                        { $eq: ['$$item.type', request.query.equipmentType] },
	                        { $eq: ['$$item.destiny', request.query.destination] },
	                    ]
	                }
	            }
	        },
	        cross: {
	            $filter: {
	                input: '$cross',
	                as: 'item',
	                cond: {
	                    $and: [
	                        { $eq: ['$$item.type', request.query.equipmentType] },
	                        { $eq: ['$$item.destiny', request.query.destination] },
	                    ]
	                }
	            }
	        },
	        local:1,
	        empty:1
	    }
	}];



	collection.aggregate(pipeline, {}, function(err, result) {
		if(err){ callback(err); }else{
			callback(result);
		}
	});
}