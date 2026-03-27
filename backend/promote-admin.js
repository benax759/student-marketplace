const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await mongoose.connection.db.collection('users').updateMany({}, { $set: { role: 'admin' } });
  console.log('Updated', result.modifiedCount, 'user(s) to admin role');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
