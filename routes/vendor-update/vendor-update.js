const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/vendor-update',
	config: { 
		description: 'Updates a vendor',
		notes: 'Updates a vendor',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWT Token'),
				id: joi.string().required().trim(),
				name: joi.string().trim(),
				disabled: joi.boolean().default(false).description('Disables Vendor')
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}