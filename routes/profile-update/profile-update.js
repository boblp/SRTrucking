const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/profile-update',
	config: { 
		description: 'Updates a profile',
		notes: 'Updates a profile',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWT Token'),
				name: joi.string()
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}