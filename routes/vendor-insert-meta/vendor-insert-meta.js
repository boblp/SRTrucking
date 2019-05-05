const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/vendor-insert-meta',
	config: { 
		description: 'Updates vendor with metadata',
		notes: 'Updates vendor with emtadata',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWT Token'),
				id: joi.string().required(),
				category: joi.string().required().valid('transport','cross','transfer','empty').required(),
				origin: joi.string(),
				destiny:joi.string(),
				mode: joi.string(),
				type: joi.string(),
				weight: joi.string(),
				type: joi.string(),
				price: joi.string()
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}