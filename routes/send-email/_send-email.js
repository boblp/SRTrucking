'use strict';
const assert = require('assert');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const moment = require("moment");
const config = require('../../util/config.js');

// const collectionName = config.collections.emails;
var response = { data: '', totalRecords: 0 };

module.exports.handler = function(request, h){
	const promise = new Promise((resolve, reject) => {
		try{
			jwt.verify(request.query.auth, 'secret', function(err, decoded) {
		    	if (err){
		    		resolve('Invalid Code or Level'); 
		    	} else {
		    		main(request, decoded, function(response){
						resolve(response);
					});
		    	}
		    });
		}catch(e){
			resolve(e.message);
		}
	}); 

	return promise;
}

const main = function(request, decoded, callback){
	// const collection = request.mongo.db.collection(collectionName);
	const insertObject = {
		email: request.query.email,
		subject: request.query.subject,
		message: request.query.message,
		createdBy: decoded.id,
		createdAt: moment(Date.now()).format('YYYY-MM-DD')
	};

	if(request.query.deckData){
		insertObject.deckData = request.query.deckData
	}

	sendEmail(insertObject).catch(console.error);

	// collection.insertOne(insertObject, function(err, result) {
	// 	if(err){ response = err }else{
	// 		response = 'success';
	// 	}

	// 	callback(response);
	// });
	callback("success");
}

async function sendEmail(data){
	let transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		auth: {
			user: "srt.emailsender@gmail.com",
			pass: "328bu5ad"
		}
	});

	let info = await transporter.sendMail({
		from: '"SRT Deck Info" <srt.emailsender@gmail.com>',
	    to: data.email,
	    subject: data.subject,
	    text: data.message,
	    html: "<b>" + data.message + "</b>"
	});

	console.log("Message sent: %s", info.messageId);
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}