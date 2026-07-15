const mongoose = require('mongoose');
const Listing = require('./src/models/Listing');
require('dotenv').config({ path: 'backend/.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const listings = await Listing.find().sort({createdAt: -1}).limit(2);
  console.log(JSON.stringify(listings.map(l => l.images), null, 2));
  process.exit(0);
}).catch(console.error);
