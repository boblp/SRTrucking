const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/order-delete',
	config: { 
		description: 'order - Deletes order',
		notes: 'order - Deletes order',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWT Token'),
				id: joi.string().required(),
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}