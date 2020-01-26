'use strict';
const assert = require('assert');
const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');
const moment = require("moment");
const ObjectId = require('mongodb').ObjectID;
var dot = require('dot-object');

// EMAIL
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
var xl = require('excel4node');

const collectionName = config.collections.orders;
var response = { data: '', totalRecords: 0 };

module.exports.handler = function(request, h) {
	const promise = new Promise((resolve, reject) => {
		try{
			jwt.verify(request.query.auth, 'secret', function(err, decoded) {
		    	if (err){
		    		resolve('Invalid Code or Level'); 
		    	} else {
		    		main(decoded, request, function(response) {
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

const main = function(decoded, request, callback){
	const collection = request.mongo.db.collection(collectionName);
	const insertObject = {
		email: request.query.email,
		subject: request.query.subject,
		message: request.query.message,
		createdBy: decoded.id,
		createdAt: moment(Date.now()).format('YYYY-MM-DD')
	};

	const deckIds = JSON.parse(request.query.deckIds);

	const deckQuery = []

	for (let i = deckIds.length - 1; i >= 0; i--) {
		deckQuery.push({
			"decks.deckNumber": deckIds[i]
		});
	};

	if(request.query.deckIds) {
		insertObject.deckData = request.query.deckData
	}

	let pipeline = [{
		$match: {
      _id: ObjectId(request.query.orderId),
      "$or": deckQuery
		}
	}];

	collection.aggregate(pipeline, {}, function(err, result) {
    if(err){ console.log(err);callback(err); } 
    else {
      let headerLabels = getHeaderLabels(request.query.mode);
      let dataAttributes = getDataAttributes(request.query.mode);

      let tableStructure = {
        autoIncrement: true,
        headerLabels: headerLabels,
        dataAttributes: dataAttributes,
        data: result
      };

      let table = generateTable(tableStructure);

      const msg = {
        to: request.query.email,
        from: 'srt.emailsender@gmail.com',
        subject: 'Sending with SendGrid is Fun',
        text: 'Test from text',
        html: table,
      };
      sgMail.send(msg).then(() => {
        console.log('Celebrate');
      })
      .catch(error => {
        console.log('Fuck: ', error.toString());
      });
		}
  });
			
    callback('jejex')
}

const generateTable = (tableStructure) => {
	let table = `<table style="width:100%; border-collapse: collapse;">
			<tr>
				${tableStructure.autoIncrement? `<th style="background-color: #303f9f; height: 15.75pt; padding: 0 2.25pt; border-width: 1pt; border-style: solid solid solid none; border-color: black; color: white;">#</th>` : null}
				${tableStructure.headerLabels.map((label) => {
					return `<th style="background-color: #303f9f; height: 15.75pt; padding: 0 2.25pt; border-width: 1pt; border-style: solid solid solid none; border-color: black; color: white;">
							${label}
					</th>`
				}).join('')}
			</tr>
			${tableStructure.data[0].decks.map((deck, index) => {
				return `<tr style="height: 15.75pt">
					${tableStructure.autoIncrement? `<td style="background-color: #C6EFCE; height: 15.75pt; padding: 0 2.25pt; border-style: none solid solid none; border-right-width: 1pt; border-bottom-width: 1pt; border-right-color: black; border-bottom-color: black;">
						${index + 1}</td>` : null}
					${tableStructure.dataAttributes.map((attr) => {
            let dotDeck = dot.dot(deck);
						return `<td style="background-color: #C6EFCE; height: 15.75pt; padding: 0 2.25pt; border-style: none solid solid none; border-right-width: 1pt; border-bottom-width: 1pt; border-right-color: black; border-bottom-color: black;">
								${dotDeck[attr]? dotDeck[attr] : (dot.pick(attr, tableStructure.data[0])? dot.pick(attr, tableStructure.data[0]) : '')}
							</td>`
					}).join('')}
				</tr>`
			}).join('')}
		</table>
	`
	return table;
}

const getHeaderLabels = (mode) => {
  switch(mode) { 
    case 'National MX':
      return ["Fecha de carga", 
      "Ventana",
      "Origen",
      "Destino",
      "Factura",
      "#planas o #equipo",
      "MX Carrier",
      "Status",
      "Tractor"
    ];
    case 'Import':
        return ["Fecha de carga", "Fecha de papeles", "Fecha de cruce", "Origen", "Destino", "Factura", "Equipo USA", "Equipo MX", "Tipo", "SCAC", "CAAT", "Transfer", "Mex. Carr", "Carrier USA", "Status"];
    case 'Export':
        return ["Fecha de carga", "Origen", "Destino", "Ventana", "Factura", "Plana", "Placas", "Estado", "SCAC", "CAAT", "Transfer", "Mex. Carr", "Status"];
    case 'National US':
        return ["Date loaded",
          "Origin",
          "Destination",
          "Invoice",
          "Trailer",
          "Truck",
          "Carrier",
          "Status",
          "Extra"
        ];
    default: 
      return [];
  }
}

const getDataAttributes = (mode) => {
  switch(mode) { 
    case 'National MX':
      return [
        "documentsDate",
					"timeWindow",
          "origin", //No es del deck, dot.pick lo busca automaticamente.
          "destiny", // no es del deck, dot.pick lo busca automaticamente.
          "invoiceClient",
          "flat_or_equipment",
					"carrierMX.name",
          "status",
          "tractor"
      ];
    case 'Import':
        return [
          "documentsDate",
          "documentsDate",
          "documentsDate",
          "origin", //No es del deck, dot.pick lo busca automaticamente.
					"destiny", // no es del deck, dot.pick lo busca automaticamente.
					"invoiceClient",
					"teamUS",
					"teamMX",
          "type", //FALTA (hardcodeado "Plana")
					"scac", 
					"caat",
          "transfer.name",
					"carrierMX.name",
					"carrierUS.name",
          "status"
        ];
    case 'Export':
        return [
          "documentsDate",
          "origin", //No es del deck, dot.pick lo busca automaticamente.
					"destiny", // no es del deck, dot.pick lo busca automaticamente.
					"timeWindow",
					"flat",
					"plates",
          "state",
          "scac",
          "caat",
          "transfer.name",
          "carrierMX.name",
          "status"
        ];
    case 'National US':
        return [
          "documentsDate",
          "origin", //No es del deck, dot.pick lo busca automaticamente.
					"destiny", // no es del deck, dot.pick lo busca automaticamente.
          "invoiceClient",
          "equipment", //trailer
          "tractor", //truck
          "carrierUS.name", 
          "status",
          "extra.name"
        ];
    default: 
      return [];
  }
}
