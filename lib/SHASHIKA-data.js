let messageStore = {};
let antiLinkDB = [];
let antiBadWordsDB = [];

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

// --- Anti Link Functions ---
function setAntiLink(jid, status) {
    const index = antiLinkDB.findIndex(item => item.jid === jid);
    if (status) {
        if (index === -1) {
            antiLinkDB.push({ jid, status: true });
        } else {
            antiLinkDB[index].status = true;
        }
    } else {
        if (index !== -1) {
            antiLinkDB[index].status = false;
        }
    }
}

function getAntiLink(jid) {
    const item = antiLinkDB.find(item => item.jid === jid);
    return item ? item.status : false;
}

// --- Anti Bad Words Functions ---
function setAntiBadWords(jid, status) {
    const index = antiBadWordsDB.findIndex(item => item.jid === jid);
    if (status) {
        if (index === -1) {
            antiBadWordsDB.push({ jid, status: true });
        } else {
            antiBadWordsDB[index].status = true;
        }
    } else {
        if (index !== -1) {
            antiBadWordsDB[index].status = false;
        }
    }
}

function getAntiBadWords(jid) {
    const item = antiBadWordsDB.find(item => item.jid === jid);
    return item ? item.status : false;
}

module.exports = {
    saveMessage,
    loadMessage,
    setAntiLink,
    getAntiLink,
    setAntiBadWords,
    getAntiBadWords
};
                
