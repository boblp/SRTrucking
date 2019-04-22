const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/order-update',
	config: { 
		description: 'order - Updates order',
		notes: 'order - Updates order',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWT Token'),
				name: joi.string().required(),
				email: joi.string().email({ minDomainAtoms: 2 }).required(),
				password: joi.string().required(),
				confirmPassword: joi.string().required(),
				level: joi.number().required()
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}