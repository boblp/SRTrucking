const joi = require('joi'); 
var handler = require('./_'+__filename.split(/[\\/]/).pop());
const PDFDocument = require("pdfkit");

module.exports = { 
	method: 'get',
	path: '/download-file',
	config: { 
		description: 'Downloads a file',
		notes: 'Downloads a file',
		tags: ['api'],
		validate: {
			query: {
				auth: joi.string().required().description('JWToken'),
				fileName: joi.string().required().description('File Name')
			}, 
			failAction: async (request, h, err) => {
		        return err;
			}
		}
	}, handler: async (request, h) => {
		return h.file(request.query.fileName, {
            mode: 'inline',
            filename: 'testing',
            confine: false
        });
	} 
}