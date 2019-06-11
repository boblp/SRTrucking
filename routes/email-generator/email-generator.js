const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop());

module.exports = { 
	method: 'get',
	path: '/email-generator',
	config: { 
		description: 'Send Email',
		notes: 'Send Email',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWToken'),
				orderId: joi.string().description('Order ID'),
				mode: joi.string().description('impo expo national etc'),
				deckIds: joi.string().description('Deck IDs to be sent')
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}