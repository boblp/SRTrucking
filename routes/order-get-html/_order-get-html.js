'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../util/config.js');
const ObjectId = require('mongodb').ObjectID;
const collectionName = config.collections.orders;
const moment = require('moment');

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
	const collection = request.mongo.db.collection(collectionName);
	const query = {
		deleted: false
	};

	if(request.query.id){
		query._id = ObjectId(request.query.id)
	}

	if(request.query.srt){
		query.srt = request.query.srt
	}

	if(request.query.createdAt){
		query.createdAt = request.query.createdAt
	}
	
	if(request.query.delivered){
		query.decks = {
			$not: {
				$elemMatch:{
					"status": {
			           $ne: "delivered"
			        }
				}
			}
		};
		query["decks.status"] = "delivered";
	}

	if(request.query.type){
		query.type = request.query.type
	}

	if(request.query.location){
		query.$or = [
			{
				origin: request.query.location
			},
			{
				destiny: request.query.location
			}
		]
	}

	if(request.query.mineOnly){
		query.createdBy = decoded.id
	}

	if (request.query.daysBack){
		let queryDate = moment().subtract(request.query.daysBack, 'days').format("YYYY-MM-DD");
		query.createdAt = { $gt: queryDate };
	}

	if(request.query.invoiceSearch){
        query.$or = [{
            "decks.invoiceClient": { "$regex" : ".*"+request.query.invoiceSearch+".*"} 
        }, {
        	"decks.invoiceVendor": { "$regex" : ".*"+request.query.invoiceSearch+".*"} 
        }, {
        	"decks.invoiceSRT": { "$regex" : ".*"+request.query.invoiceSearch+".*"}
        }, {
        	"decks.srt": { "$regex" : ".*"+request.query.invoiceSearch+".*"}
        }]
	}

	console.log(JSON.stringify(query));

	collection.find(query).toArray(function(err, result) {
		if(err){ callback(err); }else{
			if(request.query.returnExcel){
				exportExcel(request, result, function(csv){
					callback(csv);
				});
			}else{
				if(result[0]){
					var orderTable = "";
					var statusOptions = {
						"carrierMX" : "green white-text",
						"cross" : "purple white-text",
						"customs" : "white black-text",
						"transfer" : "blue white-text",
						"carrierUS" : "red white-text",
						"local" : "orange white-text",
						"empty" : "teal white-text",
						"delivered" : "green white-text",
						"canceled" : "red white-text"
					};
					for(var i=0; i<result[0].decks.length; i++) {
						if(request.query.get_type == "view"){
							orderTable += 
							"<tr data-id='"+result[0].decks[i].id+"' class='order_table_row'>"+
								"<td class='import_table export_table national_table'>"+result[0].decks[i].deckNumber+"</td>"+
								"<td class='import_table export_table national_table'><input type='text' class='browser-default  input-table' name='srt' value='"+result[0].decks[i].srt+"'></td>"+
								"<td class='export_table national_table'><input type='text' class='browser-default timepicker input-table' name='timeWindow' value='"+moment(result[0].decks[i].timeWindow, 'hh:mmA').format('hh:mmA')+"'></td>"+
								"<td class='import_table'><input type='text' class='browser-default  input-table' name='documentsDate' value='"+result[0].decks[i].documentsDate+"'></td>"+
								"<td class='import_table export_table national_table'><input type='text' class='browser-default "+(result[0].decks[i].invoiceSRT == '' ? 'red' : '')+"  input-table' name='invoiceSRT' value='"+result[0].decks[i].invoiceSRT+"'></td>"+
								"<td class='import_table export_table national_table'><input type='text' class='browser-default "+(result[0].decks[i].invoiceClient == '' ? 'red' : '')+"  input-table' name='invoiceClient' value='"+result[0].decks[i].invoiceClient+"'></td>"+
								"<td class='import_table export_table national_table'><input type='text' class='browser-default "+(result[0].decks[i].invoiceVendor == '' ? 'red' : '')+"  input-table' name='invoiceVendor' value='"+result[0].decks[i].invoiceVendor+"'></td>"+
								"<td class='import_table'><input type='text' class='browser-default  input-table' name='teamUS' value='"+result[0].decks[i].teamUS+"'></td>"+
								"<td class='import_table'><input type='text' class='browser-default  input-table' name='teamMX' value='"+result[0].decks[i].teamMX+"'></td>"+
								"<td class='import_table'><input type='text' class='browser-default  input-table' name='vehicleType' value='"+result[0].decks[i].vehicleType+"'></td>"+
								"<td class='export_table'><input type='text' class='browser-default  input-table' name='flat' value='"+result[0].decks[i].flat+"'></td>"+
								"<td class='export_table'><input type='text' class='browser-default  input-table' name='plates' value='"+result[0].decks[i].plates+"'></td>"+
								"<td class='export_table'><input type='text' class='browser-default  input-table' name='state' value='"+result[0].decks[i].state+"'></td>"+
								"<td class='national_table'><input type='text' class='browser-default  input-table' name='flat_or_equipment' value='"+result[0].decks[i].flat_or_equipment+"'></td>"+
								"<td class='import_table export_table'><input type='text' class='browser-default  input-table' name='scac' value='"+result[0].decks[i].scac+"'></td>"+
								"<td class='import_table export_table'><input type='text' class='browser-default  input-table' name='caat' value='"+result[0].decks[i].caat+"'></td>"+
								"<td class='cross_name price_listing import_table export_table'><input type='string' class='browser-default input-table' name='cross.name' value='"+result[0].decks[i].cross.name+"' list='vendor_options'></td>"+
								// "<td class='price_listing import_table export_table'><input type='number' class='browser-default input-table cost_master' name='cross.cost' value='"+result[0].decks[i].cross.cost+"'></td>"+
								// "<td class='price_listing import_table export_table'><input type='text' class='browser-default  input-table datepicker dateTable' name='cross.date' value='"+result[0].decks[i].cross.date+"'></td>"+
								// "<td class='carrierMX_name price_listing import_table export_table national_table'><select class='browser-default' name='carrierMX.name' data-value='"+result[0].decks[i].carrierMX.name+"'>"+result+"</select></td>"+
								"<td class='carrierMX_name price_listing import_table export_table national_table_mx'><input type='string' class='browser-default input-table' name='carrierMX.name' value='"+result[0].decks[i].carrierMX.name+"' list='vendor_options'></td>"+
								// "<td class='price_listing import_table export_table national_table'><input type='number' class='browser-default input-table cost_master' name='carrierMX.cost' value='"+result[0].decks[i].carrierMX.cost+"'></td>"+
								// "<td class='price_listing import_table export_table national_table'><input type='text' class='browser-default  input-table datepicker dateTable' name='carrierMX.date' value='"+result[0].decks[i].carrierMX.date+"'></td>"+
								"<td class='carrierUS_name price_listing import_table export_table national_table_us'><input type='string' class='browser-default input-table' name='carrierUS.name' value='"+result[0].decks[i].carrierUS.name+"' list='vendor_options'></td>"+
								// "<td class='price_listing import_table export_table'><input type='number' class='browser-default input-table cost_master' name='carrierUS.cost' value='"+result[0].decks[i].carrierUS.cost+"'></td>"+
								// "<td class='price_listing import_table export_table'><input type='text' class='browser-default  input-table datepicker dateTable' name='carrierUS.date' value='"+result[0].decks[i].carrierUS.date+"'></td>"+
								"<td class='transfer_name price_listing import_table export_table'><input type='string' class='browser-default input-table' name='transfer.name' value='"+result[0].decks[i].transfer.name+"' list='vendor_options'></td>"+
								// "<td class='price_listing import_table export_table'><input type='number' class='browser-default input-table cost_master' name='transfer.cost' value='"+result[0].decks[i].transfer.cost+"'></td>"+
								// "<td class='price_listing import_table export_table'><input type='text' class='browser-default  input-table datepicker dateTable' name='transfer.date' value='"+result[0].decks[i].transfer.date+"'></td>"+
								"<td class='local_name price_listing import_table export_table'><input type='string' class='browser-default input-table' name='local.name' value='"+result[0].decks[i].local.name+"' list='vendor_options'></td>"+
								// "<td class='price_listing import_table export_table'><input type='number' class='browser-default input-table cost_master' name='local.cost' value='"+result[0].decks[i].local.cost+"'></td>"+
								// "<td class='price_listing import_table export_table'><input type='text' class='browser-default  input-table datepicker dateTable' name='local.date' value='"+result[0].decks[i].local.date+"'></td>"+
								"<td class='empty_name price_listing import_table export_table'><input type='string' class='browser-default input-table' name='empty.name' value='"+result[0].decks[i].empty.name+"' list='vendor_options'></td>"+
								// "<td class='price_listing import_table export_table'><input type='number' class='browser-default input-table cost_master' name='empty.cost' value='"+result[0].decks[i].empty.cost+"'></td>"+
								"<td class='extraName import_table export_table national_table extra_table'><input type='string' class='browser-default input-table' name='extraName' value='"+(!result[0].decks[i].extraName ? "" : result[0].decks[i].extraName)+"' list='vendor_options'></td>"+
								"<td class='import_table export_table national_table extra_table'><input type='text' class='browser-default  input-table' name='extra' value='"+result[0].decks[i].extra+"'></td>"+
								// "<td class='export_table'><input type='text' class='browser-default  input-table' name='documentsStatus' value='"+result[0].decks[i].documentsStatus+"'></td>"+
								"<td class='export_table'><select class='browser-default "+(result[0].decks[i].documentsStatus == 'Pending' ? 'red white-text' : 'green white-text')+"' name='documentsStatus'>";
								if(result[0].decks[i].documentsStatus == 'Pending' || result[0].decks[i].documentsStatus == '' || typeof result[0].decks[i].documentsStatus == 'undefined'){
									orderTable += "<option value='Pending' class='red white-text' selected>Pending</option><option value='Done' class='green white-text'>Done</option>";
								}else{
									orderTable += "<option value='Pending' class='red white-text'>Pending</option><option value='Done' class='green white-text' selected>Done</option>";
								}
								orderTable +=
								"</select></td>"+
								"<td class='import_table export_table national_table status'><select class='browser-default "+statusOptions[result[0].decks[i].status]+"' name='status'>";
								if(result[0].decks[i].status == ''){
									orderTable += "<option value='Not Started' class='white black-text' selected>Not Started</option>";
								}else{
									orderTable += "<option value='Not Started' class='white black-text'>Not Started</option>";
								}
								for (var key in statusOptions) {
									if(key == result[0].decks[i].status){
										orderTable += "<option value='"+key+"' class='"+statusOptions[key]+"' selected>"+key+"</option>";
									}else{
										orderTable += "<option value='"+key+"' class='"+statusOptions[key]+"'>"+key+"</option>";	
									}
									
								}
								orderTable += "</select</td>"+
								"<td class='import_table export_table national_table'><input type='text' class='browser-default  input-table' name='notes' value='"+result[0].decks[i].notes+"'></td>"+
								"<td class='national_table'><input type='text' class='browser-default  input-table' name='tractor' value='"+result[0].decks[i].tractor+"'></td>"+
								"<td class='import_table export_table national_table files_table overflow_hidden' style='max-width:104px'>"+(!result[0].decks[i].instructionsLetter_file ? "<input type='file' data-name='instructionsLetter' data-value='"+result[0].decks[i].id+"' name='instructionsLetter_file' class='file-path-order-view'>" : "<a target='_blank' href='"+ result[0].decks[i].instructionsLetter_file +"'><i class='material-icons blue-text file_icon'>insert_drive_file</i></a>")+"</td>"+
								"<td class='import_table export_table national_table files_table overflow_hidden' style='max-width:104px'>"+(!result[0].decks[i].manifest_file ? "<input type='file' data-name='manifest' data-value='"+result[0].decks[i].id+"' name='manifest_file' class='file-path-order-view'>" : "<a target='_blank' href='"+ result[0].decks[i].manifest_file +"'><i class='material-icons blue-text file_icon'>insert_drive_file</i></a>")+"</td>"+
								"<td class='import_table export_table national_table files_table overflow_hidden' style='max-width:104px'>"+(!result[0].decks[i].motion_file ? "<input type='file' data-name='motion' data-value='"+result[0].decks[i].id+"' name='motion_file' class='file-path-order-view'>" : "<a target='_blank' href='"+ result[0].decks[i].motion_file +"'><i class='material-icons blue-text file_icon'>insert_drive_file</i></a>")+"</td>"+
								"<td class='import_table export_table national_table files_table overflow_hidden' style='max-width:104px'>"+(!result[0].decks[i].clientInvoice_file ? "<input type='file' data-name='clientInvoice' data-value='"+result[0].decks[i].id+"' name='clientInvoice_file' class='file-path-order-view'>" : "<a target='_blank' href='"+ result[0].decks[i].clientInvoice_file +"'><i class='material-icons blue-text file_icon'>insert_drive_file</i></a>")+"</td>"+
								"<td class='import_table export_table national_table files_table overflow_hidden' style='max-width:104px'>"+(!result[0].decks[i].clientInvoiceXml_file ? "<input type='file' data-name='clientInvoiceXml' data-value='"+result[0].decks[i].id+"' name='clientInvoiceXml_file' class='file-path-order-view'>" : "<a target='_blank' href='"+ result[0].decks[i].clientInvoiceXml_file +"'><i class='material-icons blue-text file_icon'>insert_drive_file</i></a>")+"</td>"+
								"<td class='import_table export_table national_table files_table overflow_hidden' style='max-width:104px'>"+(!result[0].decks[i].releaseOrder_file ? "<input type='file' data-name='releaseOrder' data-value='"+result[0].decks[i].id+"' name='releaseOrder_file' class='file-path-order-view'>" : "<a target='_blank' href='"+ result[0].decks[i].releaseOrder_file +"'><i class='material-icons blue-text file_icon'>insert_drive_file</i></a>")+"</td>"+
								"<td class='import_table export_table national_table extra_table'><input type='text' class='browser-default input-table' name='driver' value='"+result[0].decks[i].driver+"'></td>"+
								"<td class='import_table export_table national_table extra_table'><input type='text' class='browser-default input-table datepicker dateTable' name='deliveryDate' value='"+result[0].decks[i].deliveryDate+"'></td>"+
								"<td class='import_table export_table national_table extra_table'><input type='text' class='browser-default input-table' name='clientRepresentative' value='"+result[0].decks[i].clientRepresentative+"'></td>"+
								"<td class='import_table export_table national_table extra_table'><input type='text' class='browser-default input-table' name='model' value='"+result[0].decks[i].model+"'></td>"+
								"<td><input type='number' class='browser-default input-table' name='actualPrice' value='"+result[0].decks[i].actualPrice+"' readonly hidden></td>"+
								"<td><input type='number' class='browser-default input-table' name='totalSale' value='"+result[0].decks[i].totalSale+"' hidden></td>"+
								"<td><input type='number' class='browser-default input-table' name='margin' value='"+result[0].decks[i].margin+"' readonly hidden></td>"+
							"</tr>";
						}else{
							orderTable += 
								"<tr data-id='"+result[0].decks[i].id+"' class='order_table_master_row'>"+
									"<td>"+result[0].decks[i].deckNumber+"</td>"+
									"<td><input type='text' class='browser-default  input-table' name='srt' value='"+result[0].decks[i].srt+"'></td>"+
									"<td class='import_table export_table'><input type='text' class='browser-default  input-table' name='notes' value='"+result[0].decks[i].notes+"'></td>"+
									"<td class='cross_name import_table export_table price_listing'><input type='string' class='browser-default input-table' name='empty.name' value='"+result[0].decks[i].cross.name+"' list='vendor_options'></td>"+
									"<td class='import_table export_table price_listing'><input type='text' class='browser-default input-table' name='cross.invoice' value='"+result[0].decks[i].cross.invoice+"'></td>"+
									"<td class='import_table export_table price_listing'><input type='text' class='browser-default input-table' name='cross.date' value='"+result[0].decks[i].cross.date+"'></td>"+
									"<td class='import_table export_table price_listing'><input type='text' class='browser-default input-table' name='cross.paymentDate' value='"+result[0].decks[i].cross.paymentDate+"'></td>"+
									"<td class='carrierMX_name import_table export_table national_table_mx price_listing'><input type='string' class='browser-default input-table' name='empty.name' value='"+result[0].decks[i].carrierMX.name+"' list='vendor_options'></td>"+
									"<td class='import_table export_table national_table_mx price_listing'><input type='text' class='browser-default input-table' name='carrierMX.invoice' value='"+result[0].decks[i].carrierMX.invoice+"'></td>"+
									"<td class='import_table export_table national_table_mx price_listing'><input type='text' class='browser-default input-table datepicker dateTable' name='carrierMX.date' value='"+result[0].decks[i].carrierMX.date+"'></td>"+
									"<td class='import_table export_table national_table_mx price_listing'><input type='text' class='browser-default input-table datepicker dateTable' name='carrierMX.paymentDate' value='"+result[0].decks[i].carrierMX.paymentDate+"'></td>"+
									"<td class='carrierUS_name import_table export_table national_table_us price_listing'><input type='string' class='browser-default input-table' name='empty.name' value='"+result[0].decks[i].carrierUS.name+"' list='vendor_options'></td>"+
									"<td class='import_table export_table national_table_us price_listing'><input type='text' class='browser-default input-table' name='carrierUS.invoice' value='"+result[0].decks[i].carrierUS.invoice+"'></td>"+
									"<td class='import_table export_table national_table_us price_listing'><input type='text' class='browser-default input-table datepicker dateTable' name='carrierUS.date' value='"+result[0].decks[i].carrierUS.date+"'></td>"+
									"<td class='import_table export_table national_table_us price_listing'><input type='text' class='browser-default input-table datepicker dateTable' name='carrierUS.paymentDate' value='"+result[0].decks[i].carrierUS.paymentDate+"'></td>"+
									"<td class='transfer_name import_table export_table price_listing'><input type='string' class='browser-default input-table' name='empty.name' value='"+result[0].decks[i].transfer.name+"' list='vendor_options'></td>"+
									"<td class='import_table export_table price_listing'><input type='text' class='browser-default input-table' name='transfer.invoice' value='"+result[0].decks[i].transfer.invoice+"'></td>"+
									"<td class='import_table export_table price_listing'><input type='text' class='browser-default input-table datepicker dateTable' name='transfer.date' value='"+result[0].decks[i].transfer.date+"'></td>"+
									"<td class='import_table export_table price_listing'><input type='text' class='browser-default input-table datepicker dateTable' name='transfer.paymentDate' value='"+result[0].decks[i].transfer.paymentDate+"'></td>"+
									"<td class='local_name import_table export_table price_listing'><input type='string' class='browser-default input-table' name='empty.name' value='"+result[0].decks[i].local.name+"' list='vendor_options'></td>"+
									"<td class='import_table export_table price_listing'><input type='text' class='browser-default input-table' name='local.invoice' value='"+result[0].decks[i].local.invoice+"'></td>"+
									"<td class='import_table export_table price_listing'><input type='text' class='browser-default input-table datepicker dateTable' name='local.date' value='"+result[0].decks[i].local.date+"'></td>"+
									"<td class='import_table export_table price_listing'><input type='text' class='browser-default input-table datepicker dateTable' name='local.paymentDate' value='"+result[0].decks[i].local.paymentDate+"'></td>"+
									"<td class='empty_name import_table export_table price_listing'><input type='string' class='browser-default input-table' name='empty.name' value='"+result[0].decks[i].empty.name+"' list='vendor_options'></td>"+
									"<td class='import_table export_table price_listing'><input type='text' class='browser-default input-table' name='empty.invoice' value='"+result[0].decks[i].empty.invoice+"'></td>"+
									"<td class='import_table export_table price_listing'><input type='text' class='browser-default input-table datepicker dateTable' name='empty.date' value='"+result[0].decks[i].empty.date+"'></td>"+
									"<td class='import_table export_table price_listing'><input type='text' class='browser-default input-table datepicker dateTable' name='empty.paymentDate' value='"+result[0].decks[i].empty.paymentDate+"'></td>"+
									"<td><input type='text' class='browser-default input-table' name='invoiceSRT' value='"+result[0].decks[i].invoiceSRT+"'></td>"+
									"<td><input type='text' class='browser-default input-table' name='invoiceClient' value='"+result[0].decks[i].invoiceClient+"'></td>"+
									"<td><input type='text' class='browser-default input-table' name='invoiceVendor' value='"+result[0].decks[i].invoiceVendor+"'></td>"+
									"<td><input type='text' class='browser-default input-table' name='rc' value='"+result[0].decks[i].rc+"'></td>"+
									"<td><input type='text' class='browser-default input-table datepicker dateTable' name='paymentNafinas' value='"+result[0].decks[i].paymentNafinas+"'></td>"+
									"<td><input type='text' class='browser-default input-table' name='rebilling' value='"+result[0].decks[i].rebilling+"'></td>";
									// "<td style='display:none;'>"+
									// 	"<div class='file-field input-field'>"+
									// 		"<div class='btn'>"+
									// 			"<span>File</span>"+
									// 			"<input type='file' name='file_"+result[0].decks[i].id+"'>"+
									// 		"</div>"+
									// 		"<div class='file-path-wrapper'>"+
									// 			"<input class='file-path validate' type='text' name='POD' decks-id='"+result[0].decks[i].id+"' value='"+result[0].decks[i].POD+"'>"+
									// 		"</div>"+
									// 	"</div>"+
									// "</td>";
									orderTable += "<td style='display:none;'>"+
										"<input class='POD_file_"+result[0].decks[i].id+"' type='text' name='POD' decks-id='"+result[0].decks[i].id+"' value='"+result[0].decks[i].POD+"'>"+
										"<input id='POD_file_"+result[0].decks[i].id+"' name='POD_file' value='"+result[0].decks[i].POD_file+"' hidden>"+
									"</td>";
									if(result[0].decks[i].POD_file == '' || typeof result[0].decks[i].POD_file == 'undefined'){
										orderTable += "<td hidden><a id='link_POD_"+result[0].decks[i].id+"'></td>";
									}else{
										orderTable += "<td hidden><a id='link_POD_"+result[0].decks[i].id+"' href='"+result[0].decks[i].POD_file+"' target='_blank'>"+result[0].decks[i].POD_file+"</td>";
									}
									orderTable += "<td style='display:none;'>"+
										"<input class='vendorInvoice_file_"+result[0].decks[i].id+"' type='text' name='vendorInvoice' decks-id='"+result[0].decks[i].id+"' value='"+result[0].decks[i].vendorInvoice+"'>"+
										"<input id='vendorInvoice_file_"+result[0].decks[i].id+"' name='vendorInvoice_file' value='"+result[0].decks[i].vendorInvoice_file+"' hidden>"+
									"</td>";
									if(result[0].decks[i].vendorInvoice_file == '' || typeof result[0].decks[i].vendorInvoice_file == 'undefined'){
										orderTable += "<td hidden><a id='link_vendorInvoice_"+result[0].decks[i].id+"'></td>";
									}else{
										orderTable += "<td hidden><a id='link_vendorInvoice_"+result[0].decks[i].id+"' href='"+result[0].decks[i].vendorInvoice_file+"' target='_blank'>"+result[0].decks[i].vendorInvoice_file+"</td>";
									}
									orderTable += "<td style='display:none;'>"+
										"<input class='vendorInvoiceXml_file_"+result[0].decks[i].id+"' type='text' name='vendorInvoiceXml' decks-id='"+result[0].decks[i].id+"' value='"+result[0].decks[i].vendorInvoiceXml+"'>"+
										"<input id='vendorInvoiceXml_file_"+result[0].decks[i].id+"' name='vendorInvoiceXml_file' value='"+result[0].decks[i].vendorInvoiceXml_file+"' hidden>"+
									"</td>";
									if(result[0].decks[i].vendorInvoiceXml_file == '' || typeof result[0].decks[i].vendorInvoiceXml_file == 'undefined'){
										orderTable += "<td hidden><a id='link_vendorInvoiceXml_"+result[0].decks[i].id+"'></td>";
									}else{
										orderTable += "<td hidden><a id='link_vendorInvoiceXml_"+result[0].decks[i].id+"' href='"+result[0].decks[i].vendorInvoiceXml_file+"' target='_blank'>"+result[0].decks[i].vendorInvoiceXml_file+"</td>";
									}
									orderTable += "<td style='display:none;'>"+
										"<input class='vendorPaymentReceipt_file_"+result[0].decks[i].id+"' type='text' name='vendorPaymentReceipt' decks-id='"+result[0].decks[i].id+"' value='"+result[0].decks[i].vendorPaymentReceipt+"'>"+
										"<input id='vendorPaymentReceipt_file_"+result[0].decks[i].id+"' name='vendorPaymentReceipt_file' value='"+result[0].decks[i].vendorPaymentReceipt_file+"' hidden>"+
									"</td>";
									if(result[0].decks[i].vendorPaymentReceipt_file == '' || typeof result[0].decks[i].vendorPaymentReceipt_file == 'undefined'){
										orderTable += "<td hidden><a id='link_vendorPaymentReceipt_"+result[0].decks[i].id+"'></td>";
									}else{
										orderTable += "<td hidden><a id='link_vendorPaymentReceipt_"+result[0].decks[i].id+"' href='"+result[0].decks[i].vendorPaymentReceipt_file+"' target='_blank'>"+result[0].decks[i].vendorPaymentReceipt_file+"</td>";
									}
									orderTable += "<td style='display:none;'>"+
										"<input class='paymentAddOn_file_"+result[0].decks[i].id+"' type='text' name='paymentAddOn' decks-id='"+result[0].decks[i].id+"' value='"+result[0].decks[i].paymentAddOn+"'>"+
										"<input id='paymentAddOn_file_"+result[0].decks[i].id+"' name='paymentAddOn_file' value='"+result[0].decks[i].paymentAddOn_file+"' hidden>"+
									"</td>";
									if(result[0].decks[i].paymentAddOn_file == '' || typeof result[0].decks[i].paymentAddOn_file == 'undefined'){
										orderTable += "<td hidden><a id='link_paymentAddOn_"+result[0].decks[i].id+"'></td>";
									}else{
										orderTable += "<td hidden><a id='link_paymentAddOn_"+result[0].decks[i].id+"' href='"+result[0].decks[i].paymentAddOn_file+"' target='_blank'>"+result[0].decks[i].paymentAddOn_file+"</td>";
									}
									orderTable += "<td style='display:none;'>"+
										"<input class='clientInvoice_file_"+result[0].decks[i].id+"' type='text' name='clientInvoice' decks-id='"+result[0].decks[i].id+"' value='"+result[0].decks[i].clientInvoice+"'>"+
										"<input id='clientInvoice_file_"+result[0].decks[i].id+"' name='clientInvoice_file' value='"+result[0].decks[i].clientInvoice_file+"' hidden>"+
									"</td>";
									if(result[0].decks[i].clientInvoice_file == '' || typeof result[0].decks[i].clientInvoice_file == 'undefined'){
										orderTable += "<td hidden><a id='link_clientInvoice_"+result[0].decks[i].id+"'></td>";
									}else{
										orderTable += "<td hidden><a id='link_clientInvoice_"+result[0].decks[i].id+"' href='"+result[0].decks[i].clientInvoice_file+"' target='_blank'>"+result[0].decks[i].clientInvoice_file+"</td>";
									}
									orderTable += "<td style='display:none;'>"+
										"<input class='clientInvoiceXml_file_"+result[0].decks[i].id+"' type='text' name='clientInvoiceXml' decks-id='"+result[0].decks[i].id+"' value='"+result[0].decks[i].clientInvoiceXml+"'>"+
										"<input id='clientInvoiceXml_file_"+result[0].decks[i].id+"' name='clientInvoiceXml_file' value='"+result[0].decks[i].clientInvoiceXml_file+"' hidden>"+
									"</td>";
									if(result[0].decks[i].clientInvoiceXml_file == '' || typeof result[0].decks[i].clientInvoiceXml_file == 'undefined'){
										orderTable += "<td hidden><a id='link_clientInvoiceXml_"+result[0].decks[i].id+"'></td>";
									}else{
										orderTable += "<td hidden><a id='link_clientInvoiceXml_"+result[0].decks[i].id+"' href='"+result[0].decks[i].clientInvoiceXml_file+"' target='_blank'>"+result[0].decks[i].clientInvoiceXml_file+"</td>";
									}
									orderTable +=
									"<td class='import_table export_table'><input type='number' class='browser-default input-table cost_master' name='cross.cost' value='"+result[0].decks[i].cross.cost+"'></td>"+
									"<td class='import_table export_table national_table_mx'><input type='number' class='browser-default input-table cost_master' name='carrierMX.cost' value='"+result[0].decks[i].carrierMX.cost+"'></td>"+
									"<td class='import_table export_table national_table_us'><input type='number' class='browser-default input-table cost_master' name='carrierUS.cost' value='"+result[0].decks[i].carrierUS.cost+"'></td>"+
									"<td class='import_table export_table'><input type='number' class='browser-default input-table cost_master' name='transfer.cost' value='"+result[0].decks[i].transfer.cost+"'></td>"+
									"<td class='import_table export_table'><input type='number' class='browser-default input-table cost_master' name='local.cost' value='"+result[0].decks[i].local.cost+"'></td>"+
									"<td class='import_table export_table'><input type='number' class='browser-default input-table cost_master' name='empty.cost' value='"+result[0].decks[i].empty.cost+"'></td>"+
									"<td><input type='number' class='browser-default input-table' name='actualPrice' value='"+result[0].decks[i].actualPrice+"' readonly></td>"+
									"<td><input type='number' class='browser-default input-table' name='totalSale' value='"+result[0].decks[i].totalSale+"'></td>"+
									"<td><input type='number' class='browser-default input-table' name='margin' value='"+result[0].decks[i].margin+"' readonly></td>";
									orderTable +=
									"<td class='import_table export_table national_table status'><select class='browser-default ' name='status'>";
									if(result[0].decks[i].status == ''){
										orderTable += "<option value='Not Started' class='white black-text' selected>Not Started</option>";
									}else{
										orderTable += "<option value='Not Started' class='white black-text'>Not Started</option>";
									}
									for (var key in statusOptions) {
									if(key == result[0].decks[i].status){
										orderTable += "<option value='"+key+"' class='"+statusOptions[key]+"' selected>"+key+"</option>";
									}else{
										orderTable += "<option value='"+key+"' class='"+statusOptions[key]+"'>"+key+"</option>";	
									}
									
								}
									orderTable += "</select</td>"+
									"<td><select class='browser-default ' name='vendorPaymentStatus'>";
									if(result[0].decks[i].vendorPaymentStatus == 'false' || typeof result[0].decks[i].vendorPaymentStatus == 'undefined'){
										orderTable += "<option value='false' selected>Not paid</option><option value='true'>Paid</option>";
									}else{
										orderTable += "<option value='false'>Not paid</option><option value='true' selected>Paid</option>";
									}
									orderTable +=
									"</select></td>"+
									"<td><select class='browser-default ' name='clientPaymentStatus'>";
									if(result[0].decks[i].clientPaymentStatus == 'false' || typeof result[0].decks[i].clientPaymentStatus == 'undefined'){
										orderTable += "<option value='false' selected>Not paid</option><option value='true'>Paid</option>";
									}else{
										orderTable += "<option value='false'>Not paid</option><option value='true' selected>Paid</option>";
									}
									orderTable +=
									"</select>"+
									"</td>"+
									"<td>"+
									(result[0].decks[i].POD_file != '' ? "<a class='tooltipped' target='_blank' href='"+result[0].decks[i].POD_file+"' data-position='bottom' data-delay='50' data-tooltip='POD'><i class='material-icons blue-text file_icon'>insert_drive_file</i></a>" : "<i class='material-icons light_black file_icon'>insert_drive_file</i>" )+
									(result[0].decks[i].vendorInvoice_file != '' ? "<a class='tooltipped' target='_blank' href='"+result[0].decks[i].vendorInvoice_file+"' data-position='bottom' data-delay='50' data-tooltip='Vendor Invoice'><i class='material-icons blue-text file_icon'>insert_drive_file</i></a>" : "<i class='material-icons light_black file_icon'>insert_drive_file</i>" )+
									(result[0].decks[i].vendorInvoiceXml_file != '' ? "<a class='tooltipped' target='_blank' href='"+result[0].decks[i].vendorInvoiceXml_file+"' data-position='bottom' data-delay='50' data-tooltip='Vendor Invoice XML'><i class='material-icons blue-text file_icon'>insert_drive_file</i></a>" : "<i class='material-icons light_black file_icon'>insert_drive_file</i>" )+
									(result[0].decks[i].vendorPaymentReceipt_file != '' ? "<a class='tooltipped' target='_blank' href='"+result[0].decks[i].vendorPaymentReceipt_file+"' data-position='bottom' data-delay='50' data-tooltip='VPR'><i class='material-icons blue-text file_icon'>insert_drive_file</i></a>" : "<i class='material-icons light_black file_icon'>insert_drive_file</i>" )+
									(result[0].decks[i].paymentAddOn_file != '' ? "<a class='tooltipped' target='_blank' href='"+result[0].decks[i].paymentAddOn_file+"' data-position='bottom' data-delay='50' data-tooltip='Payment Addon'><i class='material-icons blue-text file_icon'>insert_drive_file</i></a>" : "<i class='material-icons light_black file_icon'>insert_drive_file</i>" )+
									(result[0].decks[i].clientInvoice_file != '' ? "<a class='tooltipped' target='_blank' href='"+result[0].decks[i].clientInvoice_file+"' data-position='bottom' data-delay='50' data-tooltip='Client Invoice'><i class='material-icons blue-text file_icon'>insert_drive_file</i></a>" : "<i class='material-icons light_black file_icon'>insert_drive_file</i>" )+
									(result[0].decks[i].clientInvoiceXml_file != '' ? "<a class='tooltipped' target='_blank' href='"+result[0].decks[i].clientInvoiceXml_file+"' data-position='bottom' data-delay='50' data-tooltip='Client Invoice XML'><i class='material-icons blue-text file_icon'>insert_drive_file</i></a>" : "<i class='material-icons light_black file_icon'>insert_drive_file</i>" )+
									"</td>"+
									"<td><button type='text' data-id='"+result[0].decks[i].id+"' class='browser-default file_btn_master'>Files</button></td>"+
								"</tr>";
						}
					}

					var html='';
					var notes = '';

					if(result[0].creationNotes != undefined && result[0].creationNotes != ''){
						notes = result[0].creationNotes;
					}else{
						notes = "No notes included, perhaps <b>"+result[0].lastModifier+"</b> has more details.";
					}
						
					html += '<div class="row margin_0">';
					html += '<div class="col s3"><p>Client: <span class="blue-text">'+result[0].client+'</span></p></div>';
					html += '<div class="col s3"><p>Origin: <span class="blue-text">'+result[0].origin+'</span></p></div>';
					html += '<div class="col s4"><p>Destination: <span class="blue-text">'+result[0].destiny+'</span></p></div>';
					html += '<div class="col s2"><p>Decks: <span class="blue-text">'+result[0].qty+'</span></p></div>';
					html += '<div class="col s3"><p>Type: <span class="blue-text">'+result[0].type+'</span></p></div>';
					html += '<div class="col s3"><p>Federal Zone: <span class="blue-text">'+result[0].fz+'</span></p></div>';
					html += '<div class="col s6"><p>Schedule: <span class="blue-text">'+result[0].time+'</span></p></div>';
					if(result[0].delivered){
						html += '<div class="col s3"><p>Shipping Status: <span class="blue-text">Delivered</span></p></div>';
					}else{
						html += '<div class="col s3"><p>Shipping Status: <span class="blue-text">Not delivered</span></p></div>';
					}
					html += '<div class="col s3"><p>Created At: <span class="blue-text">'+result[0].createdAt+'</span></p></div>';
					html += '<div class="col s6"><p>Last modification by: <span class="blue-text">'+result[0].lastModifier+' at '+result[0].modifiedAt+'</span></p></div>';
					html += '<div class="col s12 margin_top_20"><p>'+notes+'</p></div>';
					html += '</div>';



					var arrayResponse = {
						status : "success",
						deckNumber : result[0].decks.length,
						orderTable : orderTable,
						html : html,
						type : result[0].type
					};
					
					callback(arrayResponse);
				}else{
					var arrayResponse = {
						status : "error",
						data: "decks undefined?"
					};
					
					callback(arrayResponse);
				}
			}
		}
	});
}

const exportExcel = function(request, results, callback){
	const json2csv = require('json2csv').parse;
	const fields = csvFields(request.query.type);
	const opts = { fields };

	try {
		const csv = json2csv(results[0].decks, opts);
		callback(csv);
	} catch (err) {
		console.error(err);
		callback(err);
	}
}

const csvFields = function(type){
	const fields = [{
		label: 'Deck Number',
		value: 'deckNumber'
	},{
		label: 'SRT',
		value: 'srt'
	},{
		label: 'Time Window',
		value: 'timeWindow'
	},{
		label: 'Invoice',
		value: 'invoice'
	},{
		label: 'Status',
		value: 'status'
	}];

	


	if(type == 'National MX'){
		fields.push({label: 'Vehicle Type',value: 'vehicleType'});
		fields.push({label:"Flar or Equipment",value:"flat_or_equipment"});
		fields.push({label:"CarrierMX Name",value:"carrierMX.name"});
		fields.push({label:"CarrierMX Invoice",value:"carrierMX.invoice"});
		fields.push({label:"CarrierMX Date",value:"carrierMX.date"});
		fields.push({label:"CarrierMX Cost",value:"carrierMX.cost"});
		fields.push({label:"CarrierMX Payment Date",value:"carrierMX.paymentDate"});
		fields.push({label:"CarrierMX Status",value:"carrierMX.status"});
		fields.push({label:"Tractor",value:"tractor"});
	}else if(type == 'Import'){
		fields.push({label:"Team US",value:"teamUS"});
		fields.push({label:"Team MX",value:"teamMX"});
		fields.push({label:"Scac",value:"scac"});
		fields.push({label:"Caat",value:"caat"});
		fields.push({label:"Documents Date",value:"documentsDate"});
		fields.push({label:"CarrierMX Name",value:"carrierMX.name"});
		fields.push({label:"CarrierMX Invoice",value:"carrierMX.invoice"});
		fields.push({label:"CarrierMX Date",value:"carrierMX.date"});
		fields.push({label:"CarrierMX Cost",value:"carrierMX.cost"});
		fields.push({label:"CarrierMX Payment Date",value:"carrierMX.paymentDate"});
		fields.push({label:"CarrierMX Status",value:"carrierMX.status"});
		fields.push({label:"CarrierUS Name",value:"carrierUS.name"});
		fields.push({label:"CarrierUS Invoice",value:"carrierUS.invoice"});
		fields.push({label:"CarrierUS Date",value:"carrierUS.date"});
		fields.push({label:"CarrierUS Cost",value:"carrierUS.cost"});
		fields.push({label:"CarrierUS Payment Date",value:"carrierUS.paymentDate"});
		fields.push({label:"CarrierUS Status",value:"carrierUS.status"});
		fields.push({label:"Transfer Name",value:"transfer.name"});
		fields.push({label:"Transfer Invoice",value:"transfer.invoice"});
		fields.push({label:"Transfer Date",value:"transfer.date"});
		fields.push({label:"Transfer Cost",value:"transfer.cost"});
		fields.push({label:"Transfer Payment Date",value:"transfer.paymentDate"});
		fields.push({label:"Transfer Status",value:"transfer.status"});
		fields.push({label:"Cross Name",value:"cross.name"});
		fields.push({label:"Cross Invoice",value:"cross.invoice"});
		fields.push({label:"Cross Date",value:"cross.date"});
		fields.push({label:"Cross Cost",value:"cross.cost"});
		fields.push({label:"Cross Payment Date",value:"cross.paymentDate"});
		fields.push({label:"Cross Status",value:"cross.status"});
	}else if(type == 'Export'){
		fields.push({label:"Plates",value:"plates"});
		fields.push({label:"State",value:"state"});
		fields.push({label:"SCAC",value:"scac"});
		fields.push({label:"CAAT",value:"caat"});
		fields.push({label:"CarrierMX Name",value:"carrierMX.name"});
		fields.push({label:"CarrierMX Invoice",value:"carrierMX.invoice"});
		fields.push({label:"CarrierMX Date",value:"carrierMX.date"});
		fields.push({label:"CarrierMX Cost",value:"carrierMX.cost"});
		fields.push({label:"CarrierMX Payment Date",value:"carrierMX.paymentDate"});
		fields.push({label:"CarrierMX Status",value:"carrierMX.status"});
		fields.push({label:"CarrierUS Name",value:"carrierUS.name"});
		fields.push({label:"CarrierUS Invoice",value:"carrierUS.invoice"});
		fields.push({label:"CarrierUS Date",value:"carrierUS.date"});
		fields.push({label:"CarrierUS Cost",value:"carrierUS.cost"});
		fields.push({label:"CarrierUS Payment Date",value:"carrierUS.paymentDate"});
		fields.push({label:"CarrierUS Status",value:"carrierUS.status"});
		fields.push({label:"Transfer Name",value:"transfer.name"});
		fields.push({label:"Transfer Invoice",value:"transfer.invoice"});
		fields.push({label:"Transfer Date",value:"transfer.date"});
		fields.push({label:"Transfer Cost",value:"transfer.cost"});
		fields.push({label:"Transfer Payment Date",value:"transfer.paymentDate"});
		fields.push({label:"Transfer Status",value:"transfer.status"});
		fields.push({label:"Cross Name",value:"cross.name"});
		fields.push({label:"Cross Invoice",value:"cross.invoice"});
		fields.push({label:"Cross Date",value:"cross.date"});
		fields.push({label:"Cross Cost",value:"cross.cost"});
		fields.push({label:"Cross Payment Date",value:"cross.paymentDate"});
		fields.push({label:"Cross Status",value:"cross.status"});
	}else if(type == 'National US'){
		fields.push({label: 'Vehicle Type',value: 'vehicleType'});
		fields.push({label:"Flar or Equipment",value:"flat_or_equipment"});
		fields.push({label:"CarrierUS Name",value:"carrierUS.name"});
		fields.push({label:"CarrierUS Invoice",value:"carrierUS.invoice"});
		fields.push({label:"CarrierUS Date",value:"carrierUS.date"});
		fields.push({label:"CarrierUS Cost",value:"carrierUS.cost"});
		fields.push({label:"CarrierUS Payment Date",value:"carrierUS.paymentDate"});
		fields.push({label:"CarrierUS Status",value:"carrierUS.status"});
		fields.push({label:"Tractor",value:"tractor"});
	}
	fields.push({label:"Extra Name",value:"extraName"});
	fields.push({label:"Extra",value:"extra"});
	fields.push({label:"Driver",value:"driver"});
	fields.push({label:"Actual Price",value:"actualPrice"});
	fields.push({label:"Total Sale",value:"totalSale"});
	fields.push({label:"Profit",value:"margin"});
	fields.push({label:"Notes",value:"notes"});

	return fields;
}