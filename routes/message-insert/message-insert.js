const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop());

module.exports = { 
	method: 'get',
	path: '/message-insert',
	config: { 
		description: 'Insert Message - returns Message data',
		notes: 'Insert Message - returns Message data',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required(),
				destiny: joi.string().required(),
				message: joi.number().required()
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}