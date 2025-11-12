const { DATABASE, readEnv } = require('../lib/database');
const { DataTypes } = require('sequelize');
const config = require('../config');

// ============================================================
// 🧩 Define Model
// ============================================================
const AntiDelDB = DATABASE.define('AntiDelete', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        defaultValue: 1,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'antidelete',
    timestamps: false,
    hooks: {
        beforeCreate: (record) => { record.id = 1; },
        beforeBulkCreate: (records) => {
            records.forEach(record => { record.id = 1; });
        },
    },
});

let isInitialized = false;

// ============================================================
// ⚙️ Initialize AntiDelete Table
// ============================================================
async function initializeAntiDeleteSettings() {
    if (isInitialized) return;
    try {
        const env = await readEnv();
        await AntiDelDB.sync();

        // Check if record exists; if not, create it
        const [record, created] = await AntiDelDB.findOrCreate({
            where: { id: 1 },
            defaults: { status: env.ANTI_DELETE === 'true' || false },
        });

        if (created) console.log('[AntiDelete] ➜ Created default record');
        isInitialized = true;
    } catch (error) {
        console.error('[AntiDelete] Error initializing:', error);
    }
}

// ============================================================
// 🟢 Enable/Disable AntiDelete
// ============================================================
async function setAnti(status) {
    try {
        await initializeAntiDeleteSettings();
        const [updated] = await AntiDelDB.update({ status }, { where: { id: 1 } });
        console.log(`[AntiDelete] ➜ Set to: ${status}`);
        return updated > 0;
    } catch (error) {
        console.error('[AntiDelete] Error updating status:', error);
        return false;
    }
}

// ============================================================
// 🔍 Get AntiDelete Status
// ============================================================
async function getAnti() {
    try {
        await initializeAntiDeleteSettings();
        const record = await AntiDelDB.findByPk(1);
        if (record) return record.status;

        // fallback to config
        const env = await readEnv();
        return env.ANTI_DELETE === 'true' || false;
    } catch (error) {
        console.error('[AntiDelete] Error reading status:', error);
        const env = await readEnv();
        return env.ANTI_DELETE === 'true' || false;
    }
}

// ============================================================
// 📦 Export
// ============================================================
module.exports = {
    AntiDelDB,
    initializeAntiDeleteSettings,
    setAnti,
    getAnti,
};
