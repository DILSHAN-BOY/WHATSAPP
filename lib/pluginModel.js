const mongoose = require('mongoose');

const pluginSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  path: { type: String, required: true },
  code: { type: String, required: true },
  status: { type: Boolean, default: true } // ON/OFF
});

module.exports = mongoose.model('Plugin', pluginSchema);
