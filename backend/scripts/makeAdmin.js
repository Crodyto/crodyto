const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const User = require('../models/User');

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mern_ecommerce';
  console.log('Connecting to', uri);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const res = await User.updateOne({ email: 'crodyto@gmail.com' }, { $set: { role: 'admin', isAdmin: true } });
    console.log('Update result:', res);
  } catch (err) {
    console.error('Failed to update user role:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
