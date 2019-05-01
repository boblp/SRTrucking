const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/login',
	config: { 
		description: 'Login - returns authorization token',
		notes: 'Login - returns authorization token',
		tags: ['api'],
		validate: {
			query: {
				user: joi.string().required(),
				password: joi.string().required(),
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}