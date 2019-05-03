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
				origin: joi.string().required(),
				destiny: joi.string().required(),
				qty: joi.string().required(),
				type: joi.string().required(),
				time: joi.string().required(),
				fz: joi.string().required(),
				volume: joi.string().required()
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}