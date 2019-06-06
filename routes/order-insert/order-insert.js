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
				origin: joi.string().required().trim(),
				destiny: joi.string().required().trim(),
				qty: joi.string().required().trim(),
				type: joi.string().required().trim(),
				time: joi.string().required().trim(),
				fz: joi.string().required().trim(),
				volume: joi.string().required().trim(),
				notes: joi.string(),
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}