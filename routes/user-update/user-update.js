const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/user-update',
	config: { 
		description: 'Updates a user',
		notes: 'Updates a user',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWT Token'),
				email: joi.string().email({ minDomainAtoms: 2 }).required(),
				name: joi.string(),
				phone: joi.string(),
				password: joi.string(),
				level: joi.number(),
				disabled: joi.boolean().default(false).description('Disables Vendor'),
				profilePic: joi.string()
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}