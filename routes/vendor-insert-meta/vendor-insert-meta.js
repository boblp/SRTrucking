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
				id: joi.string().trim().required(),
				category: joi.string().trim().required().valid('transport','cross','transfer','empty').required(),
				origin: joi.string().trim(),
				destiny:joi.string().trim(),
				mode: joi.string().trim(),
				type: joi.string().trim(),
				weight: joi.string().trim(),
				type: joi.string().trim(),
				price: joi.string().trim()
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}