// SHASHIKA-data/antidel.js
const mongoose = require('mongoose');

// MongoDB connection (ensure connection is established before using this)
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whatsappbot', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// ✅ AntiDelete Schema
const antiDelSchema = new mongoose.Schema({
    chatId: { type: String, required: true, unique: true },
    status: { type: Boolean, default: false }
});

// Model
const AntiDel = mongoose.model('AntiDel', antiDelSchema);

// Initialize: optional if you want default record
async function initializeAntiDeleteSettings(chatId) {
    try {
        const record = await AntiDel.findOne({ chatId });
        if (!record) {
            await AntiDel.create({ chatId, status: false });
            console.log(`[AntiDelete] Default record created for chatId: ${chatId}`);
        }
    } catch (err) {
        console.error('[AntiDelete] Initialization error:', err.message);
    }
}

// Set status
async function setAnti(chatId, status) {
    try {
        const record = await AntiDel.findOneAndUpdate(
            { chatId },
            { status },
            { upsert: true, new: true }
        );
        return record;
    } catch (err) {
        console.error('[AntiDelete] setAnti error:', err.message);
        return null;
    }
}

// Get status
async function getAnti(chatId) {
    try {
        const record = await AntiDel.findOne({ chatId });
        return record ? record.status : false;
    } catch (err) {
        console.error('[AntiDelete] getAnti error:', err.message);
        return false;
    }
}

// Get all records
async function getAllAntiDeleteSettings() {
    try {
        return await AntiDel.find({});
    } catch (err) {
        console.error('[AntiDelete] getAll error:', err.message);
        return [];
    }
}

module.exports = {
    AntiDel,
    initializeAntiDeleteSettings,
    setAnti,
    getAnti,
    getAllAntiDeleteSettings
};
