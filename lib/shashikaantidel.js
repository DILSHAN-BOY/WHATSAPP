const { DATABASE } = require('../lib/database');
const { DataTypes } = require('sequelize');
const config = require('../config');

const ChrDB = DATABASE.define('ChrMode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false,
    defaultValue: 1,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: config.CHR_MODE || false,
  },
}, {
  tableName: 'chrmode',
  timestamps: false,
  hooks: {
    beforeCreate: record => { record.id = 1; },
    beforeBulkCreate: records => { records.forEach(record => { record.id = 1; }); },
  },
});

let initialized = false;

async function initChrDB() {
  if (initialized) return;
  try {
    await ChrDB.sync();
    await ChrDB.findOrCreate({
      where: { id: 1 },
      defaults: { status: config.CHR_MODE || false }
    });
    initialized = true;
  } catch (err) {
    console.error("Error initializing CHR database:", err);
  }
}

async function setChr(status) {
  try {
    await initChrDB();
    const [updated] = await ChrDB.update({ status }, { where: { id: 1 } });
    return updated > 0;
  } catch (err) {
    console.error("Error updating CHR status:", err);
    return false;
  }
}

async function getChr() {
  try {
    await initChrDB();
    const record = await ChrDB.findByPk(1);
    return record ? record.status : (config.CHR_MODE || false);
  } catch (err) {
    console.error("Error fetching CHR status:", err);
    return config.CHR_MODE || false;
  }
}

module.exports = { ChrDB, initChrDB, setChr, getChr };
