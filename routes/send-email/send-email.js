const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop());

module.exports = { 
	method: 'get',
	path: '/send-email',
	config: { 
		description: 'Send Email',
		notes: 'Send Email',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWToken'),
				subject: joi.string().required().description('Email Subject'),
				message: joi.string().required().description('Email Message'),
				email: joi.string().required().description('Email destination'),
				deckData: joi.string().description('Deck data to be sent')
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}