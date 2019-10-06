const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop()); 

module.exports = { 
	method: 'get',
	path: '/billing-get',
	config: { 
		description: 'Get billing data - returns billing data',
		notes: 'Get billing data - returns billing data',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required(),
				origin: joi.string(),
				destination: joi.string(),
				isDelivered: joi.boolean().default(false).description('View delivered orders, by POD'),
				missingRCNafinas: joi.boolean().default(false).description('Searches by RC'),
				missingClientInvoice: joi.boolean().default(false).description('Searches by clientInvoice'),
				missingVendorInvoice: joi.boolean().default(false).description('Searches by vendorInvoice'),
				returnExcel: joi.boolean().default(false).description('returns an excel'),
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => { 
		return handler.handler(request, h); 
	} 
}