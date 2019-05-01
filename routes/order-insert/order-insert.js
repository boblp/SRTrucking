const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/order-insert',
	config: { 
		description: 'order - Creates order',
		notes: 'order - Creates order',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWT Token'),
				name: joi.string().required(),
				email: joi.string().email({ minDomainAtoms: 2 }).required(),
				password: joi.string().required(),
				confirmPassword: joi.string().required(),
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