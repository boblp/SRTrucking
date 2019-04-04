const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/register',
	config: { 
		description: 'Register - Creates User',
		notes: 'Register - Creates User',
		tags: ['api'],
		validate: {
			query: {
				name: joi.string().required(),
				email: joi.string().email({ minDomainAtoms: 2 }).required(),
				password: joi.string().required(),
				confirmPassword: joi.string().required()
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}