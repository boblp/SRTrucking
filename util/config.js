require('dotenv').config();

module.exports = {
	mongoUrl: process.env.MONGODB_URL,
 	jwtKey: 'supersecret',
 	collections: {
 		users: 'Users',
 		orders: 'Orders',
 		//logs: 'Logs',
 		vendors: 'Vendors'
 	}
};