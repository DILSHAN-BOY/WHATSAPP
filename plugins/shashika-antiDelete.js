const { cmd } = require('../command');
const { readEnv } = require('../lib/database');

let deletedMessages = {}; // Store deleted messages temporarily

// === Capture all incoming messages and save them ===
cmd({
  on: "message"
}, async (conn, m, store, { from }) => {
  if (!m.message || m.key.fromMe) return; // Skip self-messages

  // Save every message in memory
  if (!deletedMessages[from]) deletedMessages[from] = {};
  deletedMessages[from][m.key.id] = m; 
});

// === Detect deleted messages ===
cmd({
  on: "message.delete"
}, async (conn, m, store, { from, reply }) => {
  try {
    const config = await readEnv();
    if (config.ANTI_DELETE !== 'true') return;

    const deleted = m?.key;
    if (!deleted || !deleted.id) return;

    const deletedId = deleted.id;
    const chatId = from;

    if (!deletedMessages[chatId] || !deletedMessages[chatId][deletedId]) return;

    const original = deletedMessages[chatId][deletedId];
    const sender = original.key.participant || original.key.remoteJid;
    const contentType = Object.keys(original.message)[0];
    const msgObj = original.message[contentType];

    console.log(`[🧩 AntiDelete] Restoring deleted message from ${sender}`);

    await conn.sendMessage(chatId, {
      text: `⚠️ *Message deleted by:* @${sender.split('@')[0]}\n\n*Recovered below 👇*`,
      mentions: [sender]
    });

    await conn.copyNForward(chatId, original, true);
  } catch (err) {
    console.error("AntiDelete Error:", err);
    reply("❌ Error in anti-delete system.");
  }
});
