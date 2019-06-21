const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/vendor-insert',
	config: { 
		description: 'Creates vendor',
		notes: 'Creates vendor',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWT Token'),
				name: joi.string().trim().required(),
				alias: joi.string().allow("").trim(),
				scac: joi.string().trim(),
				caat: joi.string().trim()
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}