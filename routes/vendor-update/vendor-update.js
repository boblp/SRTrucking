const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/vendor-update',
	config: { 
		description: 'Updates vendor',
		notes: 'Updates vendor',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWT Token'),
				id: joi.string().required(),
				origin: joi.string().description("{ add: ['origin1', 'origin2'], remove: [''] }"),
				destiny: joi.string().description("{ add: ['destiny1', 'destiny2'], remove: [''] }"),
				disable: joi.boolean().default(false).description('Disables Vendor')
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}