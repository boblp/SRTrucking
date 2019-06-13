const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop());

module.exports = { 
	method: 'get',
	path: '/billing-image-generator',
	config: { 
		description: 'Send Email',
		notes: 'Send Email',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWToken'),
				origin: joi.string(),
				destination: joi.string(),
				isDelivered: joi.boolean().default(false).description('View delivered orders, by POD'),
				hasRC: joi.boolean().default(false).description('Searches by RC'),
				hasClientInvoice: joi.boolean().default(false).description('Searches by clientInvoice')
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}