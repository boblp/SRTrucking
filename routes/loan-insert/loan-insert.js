const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop());

module.exports = { 
	method: 'get',
	path: '/loan-insert',
	config: { 
		description: 'Insert Loan - returns Loan data',
		notes: 'Insert Loan - returns Loan data',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required(),
				amount: joi.number().required()
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}