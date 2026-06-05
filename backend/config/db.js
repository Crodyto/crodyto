const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not defined in environment');
  await mongoose.connect(uri, {
    // options left default for mongoose 6+
  });
  console.log('MongoDB connected');
};

module.exports = connectDB;
