const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop());

module.exports = { 
	method: 'get',
	path: '/loan-get',
	config: { 
		description: 'Get Profile - returns profile data',
		notes: 'Get Profile - returns profile data',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWToken'),
				timeframe: joi.string().description('Number of days to look back - accepts "All"'),
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}