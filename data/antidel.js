const AntiDelete = require("../data/AntiDelModel");
const config = require("../config");

async function initializeAntiDeleteSettings() {
    try {
        let record = await AntiDelete.findOne({ id: 1 });

        if (!record) {
            await AntiDelete.create({
                id: 1,
                status: config.ANTI_DELETE || false
            });
        }
    } catch (err) {
        console.error("AntiDelete init error:", err);
    }
}

async function setAnti(status) {
    try {
        await initializeAntiDeleteSettings();
        await AntiDelete.updateOne({ id: 1 }, { status });
        return true;
    } catch (error) {
        console.error('Error setting anti-delete status:', error);
        return false;
    }
}

async function getAnti() {
    try {
        await initializeAntiDeleteSettings();
        const record = await AntiDelete.findOne({ id: 1 });
        return record ? record.status : false;
    } catch (error) {
        console.error('Error getting anti-delete status:', error);
        return false;
    }
}

module.exports = {
    initializeAntiDeleteSettings,
    setAnti,
    getAnti
};
