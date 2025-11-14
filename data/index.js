const {
    initializeAntiDeleteSettings,
    setAnti,
    getAnti
} = require('./antidel');

const {
    saveContact,
    loadMessage,
    getName,
    getChatSummary,
    saveGroupMetadata,
    getGroupMetadata,
    saveMessageCount,
    getInactiveGroupMembers,
    getGroupMembersMessageCount,
    saveMessage,
} = require('./store');

module.exports = {
    initializeAntiDeleteSettings,
    setAnti,
    getAnti,
    saveContact,
    loadMessage,
    getName,
    getChatSummary,
    saveGroupMetadata,
    getGroupMetadata,
    saveMessageCount,
    getInactiveGroupMembers,
    getGroupMembersMessageCount,
    saveMessage,
};
