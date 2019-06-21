const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/order-get',
	config: { 
		description: 'Get order - returns order data',
		notes: 'Get order - returns order data',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required(),
				createdAt: joi.string(),
				type: joi.string(),
				location: joi.string(),
				mineOnly: joi.boolean(),
				id: joi.string(),
				viewComplete: joi.boolean().default(false).description('View complete orders'),
				delivered: joi.boolean().default(false).description('View delivered orders'),
				daysBack: joi.number().description('Days to look back')
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}