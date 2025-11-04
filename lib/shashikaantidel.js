// /lib/shashikaChr.js (example name)
const mongoose = require('mongoose');
const config = require('../config');

const ChrSchema = new mongoose.Schema({
  id: {
    type: Number,
    default: 1,
    unique: true,
  },
  status: {
    type: Boolean,
    default: config.CHR_MODE || false,
  },
});

// Model name -> "ChrMode"
const ChrDB = mongoose.model('ChrMode', ChrSchema);

let initialized = false;

// 🟢 Initialize function (create default record if not exists)
async function initChrDB() {
  if (initialized) return;
  try {
    const exists = await ChrDB.findOne({ id: 1 });
    if (!exists) {
      await ChrDB.create({ id: 1, status: config.CHR_MODE || false });
      console.log('✅ Created default CHR_MODE record');
    }
    initialized = true;
  } catch (err) {
    console.error('❌ Error initializing CHR database:', err.message);
  }
}

// 🟡 Update status
async function setChr(status) {
  try {
    await initChrDB();
    const updated = await ChrDB.findOneAndUpdate(
      { id: 1 },
      { status },
      { new: true, upsert: true }
    );
    console.log(`CHR_MODE updated to ${updated.status}`);
    return true;
  } catch (err) {
    console.error('❌ Error updating CHR status:', err.message);
    return false;
  }
}

// 🔵 Get current status
async function getChr() {
  try {
    await initChrDB();
    const record = await ChrDB.findOne({ id: 1 });
    return record ? record.status : (config.CHR_MODE || false);
  } catch (err) {
    console.error('❌ Error fetching CHR status:', err.message);
    return config.CHR_MODE || false;
  }
}

module.exports = { ChrDB, initChrDB, setChr, getChr };
