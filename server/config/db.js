const mongoose = require('mongoose');
const isProduction = process.env.NODE_ENV === 'production';

const { MongoMemoryServer } = require('mongodb-memory-server');

// load .env when not in production mode
if (!isProduction) {
  require('dotenv').load();
}

// Use bluebird for Mongoose promises
mongoose.Promise = require('bluebird');

// Enable Promises for the native MongoDB Driver
const options = {
  promiseLibrary: require('bluebird'),
  useMongoClient: true,
};

if (process.env.NODE_ENV === 'test') {
  const mongoServer = new MongoMemoryServer();
  // mongoose.createConnection(process.env.MONGO_TEST_URL || process.env.MONGODB_URL, options);
  mongoServer.getConnectionString().then(mongoUri => {
    const mongooseOpts = {
      // options for mongoose 4.11.3 and above
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000,
      useMongoClient: true, // remove this line if you use mongoose 5 and above
    };
    console.log("mongoUri", mongoUri)
    mongoose.connect(mongoUri, mongooseOpts);

    mongoose.connection.on('error', e => {
      if (e.message.code === 'ETIMEDOUT') {
        console.log(e);
        mongoose.connect(mongoUri, mongooseOpts);
      }
      console.log(e);
    });

    mongoose.connection.once('open', () => {
      console.log(`TEST: MongoDB successfully connected to ${mongoUri}`);
    });
  });
} else {
  // MONGOLAB_URI is the MongoDB url config in Heroku
  mongoose.createConnection(
    process.env.MONGODB_URL || process.env.MONGOLAB_URI,
    options
  );
}

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection Error : '));
db.once('open', () => {
  console.log('Connection ok!');
});

module.exports = mongoose;
