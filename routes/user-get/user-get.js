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
				auth: joi.string().required().description('JWToken'),
				viewDisabled: joi.boolean().default(false).description('View disabled users')
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}