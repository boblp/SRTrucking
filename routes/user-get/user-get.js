const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop());

module.exports = { 
	method: 'get',
	path: '/user-get',
	config: { 
		description: 'Get Users - returns users data',
		notes: 'Get Users - returns users data',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWToken')
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}