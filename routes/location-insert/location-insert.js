const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/location-insert',
	config: { 
		description: 'Register - Creates Location',
		notes: 'Register - Creates Location',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWT Token'),
				name: joi.string().required().trim(),
				state: joi.string().required().trim(),
				country: joi.string().required().trim()
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}