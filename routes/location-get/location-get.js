const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop());

module.exports = { 
	method: 'get',
	path: '/location-get',
	config: { 
		description: 'Get Locations - returns locations data',
		notes: 'Get Locations - returns locations data',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWToken'),
				viewDisabled: joi.boolean().default(false).description('View disabled locations')
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}