const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/vendor-insert',
	config: { 
		description: 'Creates vendor',
		notes: 'Creates vendor',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWT Token'),
				name: joi.string().required(),
				alias: joi.string(),
				origins: joi.string().description("['origin1', origin2]"),
				destinies: joi.string().description("['destiny1', destiny2]")
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}