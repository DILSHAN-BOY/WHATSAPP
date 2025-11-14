let messageStore = {};

function saveMessage(msg) {
    try {
        if (!msg.key || !msg.key.id) return;
        messageStore[msg.key.id] = msg;
    } catch (e) {
        console.log("SaveMessage Error:", e);
    }
}

function loadMessage(id) {
    return messageStore[id] || null;
}

module.exports = { saveMessage, loadMessage };
