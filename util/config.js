require('dotenv').config();

module.exports = {
	mongoUrl: process.env.MONGODB_URL,
 	jwtKey: 'supersecret',
 	collections: {
 		users: 'Users',
 		orders: 'Orders',
 		locations: 'Locations',
 		configs: 'Configs',
 		vendors: 'Vendors'
 	}
};