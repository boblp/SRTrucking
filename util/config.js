require('dotenv').config();

module.exports = {
	mongoUrl: process.env.MONGODB_URL,
 	jwtKey: 'supersecret',
 	collections: {
 		users: 'Users',
 		loans: 'Loans',
 		history: 'History',
 		logs: 'Logs',
 		admin: 'Admin',
 		messages: 'Messages'
 	}
};