const { DATABASE } = require('../lib/database');
const { DataTypes } = require('sequelize');

let isInitialized = false;

// Define AntiDelete model
const AntiDelDB = DATABASE.define('AntiDel', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'antidelete',
    timestamps: false,
});

// Initialize table
async function initializeAntiDeleteSettings() {
    if (isInitialized) return;
    try {
        await AntiDelDB.sync();
        isInitialized = true;
        console.log('[AntiDelete] Table initialized');
    } catch (err) {
        console.error('[AntiDelete] Error initializing table:', err);
    }
}

// Enable/disable
async function setAnti(status) {
    await initializeAntiDeleteSettings();
    const [updated] = await AntiDelDB.update({ status }, { where: { id: 1 } });
    return updated > 0;
}

// Get status
async function getAnti() {
    await initializeAntiDeleteSettings();
    const record = await AntiDelDB.findByPk(1);
    return record ? record.status : false;
}

// Optional: get all settings
async function getAllAntiDeleteSettings() {
    await initializeAntiDeleteSettings();
    return await AntiDelDB.findAll();
}

module.exports = {
    AntiDelDB,
    initializeAntiDeleteSettings,
    setAnti,
    getAnti,
    getAllAntiDeleteSettings
};
