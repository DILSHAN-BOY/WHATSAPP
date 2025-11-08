// data.js
const { MongoClient, ObjectId } = require('mongodb');
const { readEnv } = require('../lib/database');

let db;
let antiDelCollection;

// Initialize MongoDB connection
async function initDB() {
    if (db) return db;

    const config = await readEnv();
    const uri = config.MONGO_URI || 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    await client.connect();
    db = client.db(config.DB_NAME || 'AGNI_DB');
    antiDelCollection = db.collection('anti_delete');
    return db;
}

// Initialize AntiDelete document if not exists
async function initializeAntiDeleteSettings() {
    await initDB();
    const existing = await antiDelCollection.findOne({ _id: 'anti_delete_status' });
    if (!existing) {
        await antiDelCollection.insertOne({ _id: 'anti_delete_status', status: false });
    }
}

// Set Anti-Delete status
async function setAnti(status) {
    await initializeAntiDeleteSettings();
    const result = await antiDelCollection.updateOne(
        { _id: 'anti_delete_status' },
        { $set: { status: Boolean(status) } },
        { upsert: true }
    );
    return result.modifiedCount > 0 || result.upsertedCount > 0;
}

// Get Anti-Delete status
async function getAnti() {
    await initializeAntiDeleteSettings();
    const record = await antiDelCollection.findOne({ _id: 'anti_delete_status' });
    return record ? record.status : false;
}

module.exports = {
    initializeAntiDeleteSettings,
    setAnti,
    getAnti,
};
