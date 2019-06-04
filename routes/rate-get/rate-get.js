const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/rate-get',
	config: { 
		description: 'Get rates - returns rate data',
		notes: 'Get Rates - returns rate data',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required(),
				type: joi.string().required().valid('transport','cross','transfer','empty','local').required(),
				equipment: joi.string().required(),
				origin: joi.string().required(),
				destination: joi.string().required(),
				equipmentType: joi.string().required()

			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}