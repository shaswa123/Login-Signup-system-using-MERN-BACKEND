const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

const uri = process.env.MongoDB_URI;

let mongoConnect = async (callback) => {
	let mongoResponse = await MongoClient.connect(uri);
	// console.log(mongoResponse);
	callback(mongoResponse);
};

module.exports = mongoConnect;
