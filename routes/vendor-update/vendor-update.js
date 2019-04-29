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
				name: joi.string().required(),
				alias: joi.string(),
				origins: joi.string().description("{ add: ['origin1', 'origin2'], remove: [''] }"),
				destinies: joi.string().description("{ add: ['destiny1', 'destiny2'], remove: [''] }"),
				disabled: joi.boolean().default(false).description('Disables Vendor')
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}