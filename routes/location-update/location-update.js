const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/location-update',
	config: { 
		description: 'Updates a location',
		notes: 'Updates a location',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWT Token'),
				id: joi.string().required().trim(),
				name: joi.string().trim(),
				state: joi.string().trim(),
				country: joi.string().trim(),
				disabled: joi.boolean().default(false).description('Disables Location')
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}