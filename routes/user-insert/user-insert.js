const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/user-insert',
	config: { 
		description: 'Register - Creates User',
		notes: 'Register - Creates User',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWT Token'),
				name: joi.string().required(),
				phone: joi.string(),
				email: joi.string().email({ minDomainAtoms: 2 }).required(),
				password: joi.string().required(),
				level: joi.number().required()
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}