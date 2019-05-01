const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/profile-get',
	config: { 
		description: 'Get Profile - returns profile data',
		notes: 'Get Profile - returns profile data',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required()
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}