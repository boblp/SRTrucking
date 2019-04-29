const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/vendor-get',
	config: { 
		description: 'Get vendor - returns vendor data',
		notes: 'Get vendor - returns vendor data',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required(),
				id: joi.string(),
				name: joi.string(),
				viewDisabled: joi.boolean().default(false).description('View disabled vendors')
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}