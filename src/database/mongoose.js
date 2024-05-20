const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const url = process.env.URL_MONGO;

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
    });
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

module.exports = { connectToMongoDB };
